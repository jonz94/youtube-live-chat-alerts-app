import { Innertube, YTNodes } from 'youtubei.js'
import type { LiveChat } from 'youtubei.js/dist/src/parser/youtube'
import { VideoInfo } from './schema'
import { parseAddChatItemActionItem } from './utils'
import { io } from './websocket'

let client: Innertube | null = null

let currentLivechat: LiveChat | null = null

export async function getInnertubeClient() {
  if (client) {
    return client
  }

  client = await Innertube.create()

  return client
}

export function getCurrentLivechatState() {
  return currentLivechat === null ? 'Disconnected' : 'Connected'
}

export async function startLivechat(videoId: string) {
  const youtube = await getInnertubeClient()

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  const video = await youtube.getInfo(videoId)

  const { basic_info: basicInfo } = await youtube.getInfo(videoId)

  const videoInfo: VideoInfo = {
    id: videoId,
    isLive: !!basicInfo.is_live,
    isUpcoming: !!basicInfo.is_upcoming,
    title: basicInfo.title ?? '',
    startTimestamp: basicInfo.start_timestamp?.valueOf() ?? 0,
  }

  console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
  console.log(JSON.stringify(videoInfo, null, 2))
  console.log()

  if (!videoInfo.isLive && !videoInfo.isUpcoming) {
    console.log(`🚧 only ongoing/upcoming live streams need this feature...`)

    // return { error: 'only ongoing/upcoming live streams need this feature...', data: null }
  }

  const livechat = video.getLiveChat()

  livechat.on('error', (error) => {
    console.log('Live chat error:', error)
  })

  livechat.on('end', () => {
    console.log('This live stream has ended.')
    livechat.stop()

    currentLivechat = null

    io?.emit('youtube-livechat-connection-state-updated')
  })

  livechat.on('chat-update', (chatAction) => {
    // console.log('chat-update')
    // console.log('chat-update', chatAction)

    if (!io) {
      return
    }

    // io.emit('live-chat-debug', chatAction)

    if (chatAction.is(YTNodes.ReplayChatItemAction)) {
      for (const action of chatAction.actions) {
        if (action.is(YTNodes.AddChatItemAction)) {
          parseAddChatItemActionItem(io, action.item)
        }
      }
    }

    if (chatAction.is(YTNodes.AddChatItemAction)) {
      parseAddChatItemActionItem(io, chatAction.item)
    }
  })

  livechat.start()

  currentLivechat = livechat

  return videoInfo
}

export function stopLivechat() {
  if (!currentLivechat) {
    return
  }

  currentLivechat.stop()

  currentLivechat = null
}
