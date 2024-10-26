export type YouTubeMediaType = 'video' | 'clip' | 'channel'

export interface ParsedYoutubeUrlData {
  type: YouTubeMediaType
  id: string | null
  timestamp: string | null
}

export const EMPTY_PARSED_YOUTUBE_URL_DATA: ParsedYoutubeUrlData = { type: 'video', id: null, timestamp: null }

export function parseYoutubeUrl(originalUrl: string): ParsedYoutubeUrlData {
  const parsedUrl = (function parseUrl() {
    try {
      return new URL(originalUrl)
    } catch (error) {
      return null
    }
  })()

  if (!parsedUrl) {
    return EMPTY_PARSED_YOUTUBE_URL_DATA
  }

  if (parsedUrl.pathname === '/') {
    return EMPTY_PARSED_YOUTUBE_URL_DATA
  }

  if (parsedUrl.pathname.startsWith('/channel/') || parsedUrl.pathname.startsWith('/@')) {
    return {
      type: 'channel',
      id: parsedUrl.pathname,
      timestamp: null,
    }
  }

  const videoId = (function getVideoId() {
    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.substring(1)
    }

    if (parsedUrl.pathname.startsWith('/clip/')) {
      return parsedUrl.pathname.substring('/clip/'.length)
    }

    if (parsedUrl.pathname.startsWith('/watch')) {
      return parsedUrl.searchParams.get('v') ?? null
    }

    if (parsedUrl.pathname.startsWith('/live/')) {
      return parsedUrl.pathname.substring('/live/'.length)
    }

    if (parsedUrl.pathname.startsWith('/shorts/')) {
      return parsedUrl.pathname.substring('/shorts/'.length)
    }

    return null
  })()

  if (!videoId) {
    return EMPTY_PARSED_YOUTUBE_URL_DATA
  }

  if (parsedUrl.pathname.startsWith('/clip/')) {
    return { type: 'clip', id: videoId, timestamp: null }
  }

  const timestamp = parsedUrl.searchParams.get('t')?.replace('s', '') ?? null

  return { type: 'video', id: videoId, timestamp }
}
