import { CONNECTION_TIMEOUT_MS, ICE_GATHERING_TIME_MS, ICE_SERVER_URLS } from '../const';

/**
 * WebRTC data channel connection.
 */
export interface PeerConnection {
  pc: RTCPeerConnection;
  ch: RTCDataChannel;
}

/** The active connection. */
export let peerConn: PeerConnection | null = null;

/** Received messages from peer. */
export const messages: any[] = [];

/**
 * Create a peer connection with data channel.
 */
export function createConnection(): PeerConnection {
  const pc = new RTCPeerConnection({
    'iceServers': [{ 'urls': ICE_SERVER_URLS }]
  });
  const ch = pc.createDataChannel('data', {
    'negotiated': true,
    'id': 0,
  });
  ch.onmessage = (e) => {
    try {
      messages.push(JSON.parse(e.data));
    } catch (err) {
      process.env.DEBUG && console.warn('message error', err, e);
    }
  };

  return {
    'pc': pc,
    'ch': ch
  };
}

/**
 * Start a WebRTC connection as host and return the offer.
 */
export function host(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!peerConn) {
      peerConn = createConnection();
    }
    peerConn.pc.createOffer()
      .then(des => peerConn!.pc.setLocalDescription(des))
      .then(() => (
        peerConn!.pc.onicecandidate = (e) => !e.candidate && resolve(btoa(JSON.stringify(peerConn!.pc.localDescription)))
      ))
      .catch(reject);
  });
}

/**
 * Join a WebRTC connection and return the answer.
 */
export function join(remoteOffer: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!peerConn) {
      peerConn = createConnection();
    }
    peerConn.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteOffer))))
      .then(() => peerConn!.pc.createAnswer())
      .then((description) => peerConn!.pc.setLocalDescription(description))
      .then(() => (
        peerConn!.pc.onicecandidate = (e) => !e.candidate && resolve(btoa(JSON.stringify(peerConn!.pc.localDescription)))
      ))
      .catch(reject);
  });
}

/**
 * Accept a WebRTC remote answer in base64.
 */
export function accept(conn: PeerConnection, remoteAnswer: string): Promise<void> {
  return conn.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteAnswer))));
}

/**
 * Start the connection.
 */
export function connect(host: boolean, answer: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!peerConn || (host && !answer)) {
      return reject();
    }

    host && accept(peerConn, answer);

    if (peerConn!.ch.readyState === 'open') {
      resolve();
    } else {
      peerConn!.ch.onopen = () => resolve();
      setTimeout(reject, CONNECTION_TIMEOUT_MS);
    }
  });
}

/**
 * Close connections.
 */
export function disconnect(): void {
  if (peerConn) {
    peerConn.pc.close();
    peerConn = null;
  }
}

/**
 * Send a message to peer.
 */
export function send<T>(msg: T) {
  try {
    peerConn && peerConn.ch.send(JSON.stringify(msg));
  } catch (e) {
    process.env.DEBUG && console.warn('send error', e, msg);
  }
}
