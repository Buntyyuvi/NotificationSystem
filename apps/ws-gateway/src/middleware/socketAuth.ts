import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const socketAuth = (socket: AuthenticatedSocket, next: (err?: Error) => void): void => {
//   const token = socket.handshake.auth.token || socket.handshake.query.token;

//   if (!token || typeof token !== 'string') {
//     return next(new Error('Authentication error: Token required'));
//   }

//   try {
//     const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
//     socket.userId = decoded.userId;
//     next();
//   } catch (err) {
//     next(new Error('Authentication error: Invalid token'));
//   }
  socket.userId = 'user-1'; // DEBUG ONLY
  next();
};