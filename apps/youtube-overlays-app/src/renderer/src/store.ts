import { atom } from 'jotai'
import { VideoInfo } from '../../main/schema'

export const cacheTimestampAtom = atom(String(Date.now()))

export const viewportRefAtom = atom<React.RefObject<HTMLDivElement> | null>(null)

export const connectionVideoInfoAtom = atom<VideoInfo | null>(null)

export const hasAutoStartLivechatTriggeredToEnsureItOnlyTriggersOnceAtom = atom(false)
