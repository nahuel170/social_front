import { io } from 'socket.io-client';

const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
const socket = io(SOCKET_URI, {
  path: '/socket.io',
  transports: ['websocket'],   // opcional, fuerza WS
});

export default socket;

// import { io } from 'socket.io-client';


// const socket = io(import.meta.env.VITE_SOCKET_URI)

// export default socket;