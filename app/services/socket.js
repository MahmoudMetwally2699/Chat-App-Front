import { io } from 'socket.io-client';

let socket;

export const connectSocket = () => {
  socket = io('http://192.168.1.14:5000'); // Update with your server URL
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
  });
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
