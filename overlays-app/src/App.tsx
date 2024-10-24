import { useEffect, useState } from 'react'
import { Livechat } from '~/livechat'
import { socket } from './socket'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <p>State: {String(isConnected)}</p>
      <Livechat></Livechat>
    </div>
  )
}

export default App
