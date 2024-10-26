import { useEffect } from 'react'
import { socket } from '~/socket'

export function Livechat() {
  useEffect(() => {
    function onOpen(args: unknown) {
      console.log(args)
    }

    function onLivechat(action: unknown) {
      console.log(action)
    }

    socket.on('open', onOpen)
    socket.on('live-chat-debug', onLivechat)

    return () => {
      socket.off('open', onOpen)
      socket.off('live-chat-debug', onLivechat)
    }
  }, [])

  return null
}
