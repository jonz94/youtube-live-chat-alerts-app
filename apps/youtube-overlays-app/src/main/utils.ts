import { type Server } from 'socket.io'
import { Innertube, YTNodes } from 'youtubei.js'
import { getInnertubeClient } from './innertube'
import { ChannelInfo, VideoInfo } from './schema'
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

export async function getChannel(channelIdOrHandle: string) {
  const youtube = await getInnertubeClient()

  const channelId = await getChannelId(youtube, channelIdOrHandle)

  const channel = await youtube.getChannel(channelId)

  const header = channel.header

  if (!header) {
    return { error: '讀取 YouTube 頻道資料時發生異常 (找不到 header)', data: null }
  }

  if (header.is(YTNodes.C4TabbedHeader)) {
    const data = {
      id: channelId,
      handle: header.channel_handle?.toString() ?? null,
      name: header.author.name,
      avatar: header.author.best_thumbnail?.url ?? null,
    } satisfies ChannelInfo

    return { error: null, data }
  }

  if (header.is(YTNodes.PageHeader)) {
    const name = header.page_title
    const image = header.content?.image
    const handle =
      header.content?.metadata?.metadata_rows
        .filter((row) => row.metadata_parts?.some((part) => part.text.toString().startsWith('@')))
        .at(0)
        ?.metadata_parts?.filter((part) => part.text.toString().startsWith('@'))
        .at(0)
        ?.text.toString() ?? null

    if (!image) {
      const data = {
        id: channelId,
        handle,
        name,
        avatar: null,
      } satisfies ChannelInfo

      return { error: null, data }
    }

    if (image.is(YTNodes.DecoratedAvatarView)) {
      const data = {
        id: channelId,
        handle,
        name,
        avatar: image.avatar?.image.at(0)?.url ?? null,
      } satisfies ChannelInfo

      return { error: null, data }
    }

    const data = {
      id: channelId,
      handle,
      name,
      avatar: image.image.at(0)?.url ?? null,
    } satisfies ChannelInfo

    return { error: null, data }
  }

  console.log('new header type:', header.type)
  console.log(JSON.stringify(header, null, 2))

  return {
    error: `偵測到 YouTube 官方偷偷更新了資料格式，導致小程式目前無法讀取 YouTube 頻道資料QQ 如果您有空的話，麻煩提供以下資料，藉此讓小程式能同步跟上 YouTube 官方的更新，非常感謝您！YouTube 新的資料格式種類: ${header.type}、詳細資料內容: ${JSON.stringify(header, null, 2)}`,
    data: null,
  }
}

export async function getLiveOrUpcomingStreams(channelIdOrHandle: string) {
  const youtube = await getInnertubeClient()

  const channelId = await getChannelId(youtube, channelIdOrHandle)

  const channel = await youtube.getChannel(channelId)

  const liveStreams = await channel.getLiveStreams()

  const tab = liveStreams.current_tab

  if (!tab) {
    throw new Error('live stream tab info not found')
  }

  if (!tab.is(YTNodes.Tab)) {
    throw new Error(`tab type ${tab.type} not implemented`)
  }

  const tabContent = tab.content

  if (!tabContent) {
    throw new Error('live stream tab content is empty')
  }

  if (!tabContent.is(YTNodes.RichGrid)) {
    throw new Error(`tab content type ${tabContent.type} not implemented`)
  }

  const liveOrUpcomingStreamIds = tabContent.contents
    .filter((item) => {
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
    .map((item) => {
      if (!item.is(YTNodes.RichItem)) {
        throw new Error(`mapping item type ${item.type} not implemented`)
      }

      const content = item.content

      if (!content.is(YTNodes.Video)) {
        throw new Error(`mapping item content type ${content.type} not implemented`)
      }

      return content.id
    })

  const liveOrUpcomingStreams: VideoInfo[] = []

  for (const id of liveOrUpcomingStreamIds) {
    const { basic_info: basicInfo } = await youtube.getBasicInfo(id)

    liveOrUpcomingStreams.push({
      id,
      isLive: !!basicInfo.is_live,
      isUpcoming: !!basicInfo.is_upcoming,
      title: basicInfo.title ?? '',
      startTimestamp: basicInfo.start_timestamp?.valueOf() ?? 0,
    })
  }

  return liveOrUpcomingStreams
}
