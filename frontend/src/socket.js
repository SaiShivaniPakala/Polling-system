import { io } from 'socket.io-client';

// The URL of your backend server
const SOCKET_URL = 'http://localhost:4000';
export const socket = io(SOCKET_URL);