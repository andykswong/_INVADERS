import { CONNECTION_TIMEOUT_MS, ICE_GATHERING_TIME_MS, ICE_SERVER_URLS } from '../const';

/**
 * WebRTC data channel connection.
 */
export interface Connection {
  pc: RTCPeerConnection;
  ch: RTCDataChannel;
}

/** The active connection. */
export let conn: Connection | null = null;

/** Received messages from peer. */
export const messages: any[] = [];

/**
 * Create a connection with data channel.
 */
export function createConnection(): Connection {
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
    if (conn) {
      return reject();
    }
    conn = createConnection();
    conn.pc.createOffer()
      .then(des => conn!.pc.setLocalDescription(des))
      .then(() => {
        // Just wait for a fixed time for ICE gathering.
        // We can also listen to icecandidate event but that needs more code
        setTimeout(() => resolve(btoa(JSON.stringify(conn!.pc.localDescription))), ICE_GATHERING_TIME_MS);
      })
      .catch(reject);
  });
}

/**
 * Join a WebRTC connection and return the answer.
 */
export function join(remoteOffer: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    conn = createConnection();
    conn.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteOffer))))
      .then(() => conn!.pc.createAnswer())
      .then((description) => conn!.pc.setLocalDescription(description))
      .then(() => {
        // Just wait for a fixed time for ICE gathering.
        // We can also listen to icecandidate event but that needs more code
        setTimeout(() => resolve(btoa(JSON.stringify(conn!.pc.localDescription))), ICE_GATHERING_TIME_MS);
      })
      .catch(reject);
  });
}

/**
 * Accept a WebRTC remote answer in base64.
 */
export function accept(conn: Connection, remoteAnswer: string): Promise<void> {
  return conn.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteAnswer))));
}

/**
 * Start the connection.
 */
export function connect(host: boolean, answer: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!conn || (host && !answer)) {
      return reject();
    }

    host && accept(conn, answer);

    if (conn!.ch.readyState === 'open') {
      resolve();
    } else {
      conn!.ch.onopen = () => resolve();
      setTimeout(reject, CONNECTION_TIMEOUT_MS);
    }
  });
}

/**
 * Close connections.
 */
export function disconnect(): void {
  if (conn) {
    conn.pc.close();
    conn = null;
  }
}

/**
 * Send a message to peer.
 */
export function send<T>(msg: T) {
  try {
    conn && conn.ch.send(JSON.stringify(msg));
  } catch (e) {
    process.env.DEBUG && console.warn('send error', e, msg);
  }
}
