import { type Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'

export let io: Server | null = null

export function startWebsocket(server: HttpServer) {
  io = new Server(server, {
    path: '/ws',
    serveClient: false,
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`)

    socket.on('data', (arg) => {
      console.log(arg)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
