/**
 * Minimal signaling server.
 * @see https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
 */
module.exports = {
  io(socket) {
    // Broadcast a room join message
    socket.on('J', (room) => socket.broadcast.emit(room, socket.id));

    // Private message to a client
    socket.on('P', (type, value, id) => socket.to(id).emit('P', type, value, socket.id));
  }
};
