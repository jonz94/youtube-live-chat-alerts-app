import { type Server } from 'socket.io'
import { Innertube, YTNodes } from 'youtubei.js'
import { getSettings } from './settings'

export function parseAddChatItemActionItem(io: Server, item: YTNodes.AddChatItemAction['item']) {
  if (item.is(YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement)) {
    io.emit('live-chat-debug', { type: YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type, item })

    const header = item.header

    if (!header) {
      return
    }

    const name = header.author_name.toString()
    const primaryText = header.primary_text.toString()
    const amount = (function getAmount(text: string) {
      return text.split(' ').at(1)
    })(primaryText)

    const { animationTimeInMilliseconds } = getSettings()

    io.emit('open', { name, amount, animationTimeInMilliseconds })
    // NOTE: uncomment these lines below to simulate a delayed queue event for testing purposes
    // console.log('open', { name, amount, animationTimeInMilliseconds })
    // setTimeout(() => {
    //   io.emit('open', { name: `${name} (delay)`, amount, animationTimeInMilliseconds })
    //   console.log('open delay', { name: `${name} (delay)`, amount, animationTimeInMilliseconds })
    // }, 1000)
  }
}

export async function getChannelId(youtube: Innertube, id: string) {
  const youtubeChannelUrl = id.startsWith('@')
    ? `https://www.youtube.com/${id}`
    : `https://www.youtube.com/channel/${id}`

  const navigationEndpoint = await youtube.resolveURL(youtubeChannelUrl)

  return (navigationEndpoint.toURL() ?? '').replace('https://www.youtube.com/channel/', '')
}

export async function getLiveOrUpcomingStreams(channelIdOrHandler: string) {
  console.log('in')

  const youtube = await Innertube.create()

  const channelId = await getChannelId(youtube, channelIdOrHandler)

  console.log({ channelId })

  const channel = await youtube.getChannel(channelId)

  const liveStreams = await channel.getLiveStreams()

  const tab = liveStreams.current_tab

  if (!tab) {
    throw new Error('live stream tab info not found')
  }

  if (!tab.is(YTNodes.Tab)) {
    console.log(tab.content)

    throw new Error(`tab type ${tab.type} not implemented`)
  }

  const tabContent = tab.content

  if (!tabContent) {
    throw new Error('live stream tab content is empty')
  }

  if (!tabContent.is(YTNodes.RichGrid)) {
    console.log(tabContent)

    throw new Error(`tab content type ${tabContent.type} not implemented`)
  }

  const liveOrUpcomingStreams = tabContent.contents.filter((item) => {
    if (item.is(YTNodes.ContinuationItem)) {
      return false
    }

    if (!item.is(YTNodes.RichItem)) {
      throw new Error(`tabContent contents type ${item.type} not implemented`)
    }

    const content = item.content

    if (!content.is(YTNodes.Video)) {
      throw new Error(`tabContent contents content type ${content.type} not implemented`)
    }

    const text = content.duration.text.toLowerCase()

    return text === 'live' || text === 'upcoming'
  })

  const isLive = (liveOrUpcomingStreams ?? []).length > 0

  console.log({ isLive, liveOrUpcomingStreams })

  return { liveOrUpcomingStreams }
}
