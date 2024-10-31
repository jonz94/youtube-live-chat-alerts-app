import { io, type Socket } from 'socket.io-client'

export const socket: Socket = io('http://localhost:21829', {
  path: '/ws',
})
