import { io, type Socket } from 'socket.io-client'
import { PORT } from '../../main/const'

export const socket: Socket = io(`http://localhost:${PORT}`, {
  path: '/ws',
})
