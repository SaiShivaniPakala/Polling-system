import { io } from 'socket.io-client';

// The URL of your backend server
const SOCKET_URL = 'https://polling-system-backend-aim7.onrender.com';
export const socket = io(SOCKET_URL);
