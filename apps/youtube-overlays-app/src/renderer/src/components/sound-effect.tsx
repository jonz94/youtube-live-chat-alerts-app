import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { socket } from '~/renderer/socket'
import { cacheTimestampAtom } from '~/renderer/store'

interface PresentOptions {
  name: string
  amount: string
  animationTimeInMilliseconds: number
}

export function SoundEffect({ volume }: { volume: number }) {
  const audio1Ref = useRef<HTMLAudioElement>(null)
  const audio5Ref = useRef<HTMLAudioElement>(null)
  const audio10Ref = useRef<HTMLAudioElement>(null)
  const audio20Ref = useRef<HTMLAudioElement>(null)
  const audio50Ref = useRef<HTMLAudioElement>(null)
  const cacheTimestamp = useAtomValue(cacheTimestampAtom)

  useEffect(() => {
    if (audio1Ref.current) {
      audio1Ref.current.volume = volume / 100
    }
    if (audio5Ref.current) {
      audio5Ref.current.volume = volume / 100
    }
    if (audio10Ref.current) {
      audio10Ref.current.volume = volume / 100
    }
    if (audio20Ref.current) {
      audio20Ref.current.volume = volume / 100
    }
    if (audio50Ref.current) {
      audio50Ref.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    function onOpen({ name, amount, animationTimeInMilliseconds }: PresentOptions) {
      console.log('open', { name, amount, animationTimeInMilliseconds })

      switch (amount) {
        case '1':
        case '87':
          void audio1Ref.current?.play()
          break
        case '5':
          void audio5Ref.current?.play()
          break
        case '10':
          void audio10Ref.current?.play()
          break
        case '20':
          void audio20Ref.current?.play()
          break
        case '50':
          void audio50Ref.current?.play()
          break

        default:
          break
      }
    }

    socket.on('open', onOpen)

    return () => {
      socket.off('open', onOpen)
    }
  }, [])

  return (
    <>
      <audio ref={audio1Ref} src={`http://localhost:21829/assets/sound1.mp3?t=${cacheTimestamp}`}></audio>
      <audio ref={audio5Ref} src={`http://localhost:21829/assets/sound5.mp3?t=${cacheTimestamp}`}></audio>
      <audio ref={audio10Ref} src={`http://localhost:21829/assets/sound10.mp3?t=${cacheTimestamp}`}></audio>
      <audio ref={audio20Ref} src={`http://localhost:21829/assets/sound20.mp3?t=${cacheTimestamp}`}></audio>
      <audio ref={audio50Ref} src={`http://localhost:21829/assets/sound50.mp3?t=${cacheTimestamp}`}></audio>
    </>
  )
}
