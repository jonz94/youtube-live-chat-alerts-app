import { io } from 'socket.io-client'
import { PORT } from '~/lib/port'

export const socket = io(`http://localhost:${PORT}`, {
  path: '/ws',
})
