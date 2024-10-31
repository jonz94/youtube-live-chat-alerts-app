import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { socket } from '~/renderer/socket'
import { cacheTimestampAtom } from '~/renderer/store'

export function SoundEffect({ volume }: { volume: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [cacheTimestamp] = useAtom(cacheTimestampAtom)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume, audioRef])

  useEffect(() => {
    function onOpen() {
      console.log('open')

      if (audioRef.current) {
        audioRef.current.play()
      }
    }

    socket.on('open', onOpen)

    return () => {
      socket.off('open', onOpen)
    }
  }, [audioRef])

  return <audio ref={audioRef} src={`http://localhost:21829/assets/sound.mp3?t=${cacheTimestamp}`}></audio>
}
