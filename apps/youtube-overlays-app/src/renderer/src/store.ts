import { atom } from 'jotai'

export const cacheTimestampAtom = atom(String(Date.now()))

export const videoTitleAtom = atom('')
