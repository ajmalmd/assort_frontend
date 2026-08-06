const sockets = new Set();

export const registerSocket = (socket) => {
  sockets.add(socket);
};

export const unregisterSocket = (socket) => {
  sockets.delete(socket);
};

export const closeAllSockets = () => {
  sockets.forEach((socket) => {
    try {
      socket.close(1000, "Logout");
    } catch (_) {}
  });

  sockets.clear();
};