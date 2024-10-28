import { io } from 'socket.io-client'

export const socket = io('http://localhost:21829', {
  path: '/ws',
})
