import { atom } from 'jotai'
import { VideoInfo } from '../../main/schema'

export const cacheTimestampAtom = atom(String(Date.now()))

export const connectionVideoInfoAtom = atom<VideoInfo | null>(null)
