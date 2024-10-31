import { atom } from 'jotai'

export const cacheTimestampAtom = atom(String(Date.now()))
