import { type Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { Innertube } from 'youtubei.js'

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

export async function startLivechat(videoId: string) {
  const youtube = await Innertube.create()

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  const video = await youtube.getInfo(videoId)

  const {
    is_live: isLive,
    is_upcoming: isUpcoming,
    title,
    start_timestamp: startTimestamp,
    end_timestamp: endTimestamp,
    duration,
  } = video.basic_info

  const videoInfo = {
    isLive,
    isUpcoming,
    title,
    startTimestamp,
    endTimestamp,
    duration,
  }

  console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
  console.log(JSON.stringify(videoInfo, null, 2))
  console.log()

  if (!isLive && !isUpcoming) {
    console.log(`🚧 only ongoing/upcoming live streams need this feature...`)

    return
  }

  const livechat = video.getLiveChat()

  livechat.on('error', (error) => {
    console.log('Live chat error:', error)
  })

  livechat.on('end', () => {
    console.log('This live stream has ended.')
    livechat.stop()
  })

  livechat.on('chat-update', async (action) => {
    io?.emit('livechat', action)
  })

  livechat.start()
}
