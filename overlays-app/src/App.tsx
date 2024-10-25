import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import catgrass from './assets/catgrass.webp'
import { cn } from './lib/utils'
import { socket } from './socket'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [isOpen, setIsOpen] = useState(false)
  const [debug] = useState(true)

  function present() {
    setIsOpen(true)

    setTimeout(() => {
      setIsOpen(false)
    }, 5000)
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onOpen() {
      if (isOpen) {
        return
      }

      present()
    }

    socket.on('connect', onConnect)
    socket.on('open', onOpen)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('open', onOpen)
      socket.off('disconnect', onDisconnect)
    }
  }, [isOpen])

  return (
    <div className="min-h-screen">
      {/* {isConnected ? <Livechat></Livechat> : null} */}

      <div
        className={cn(
          'fixed flex flex-col gap-y-2 top-4 right-4 justify-center items-center border shadow p-4 rounded-md',
          debug ? '' : 'hidden',
        )}
      >
        <div className="absolute -top-1.5 -right-1.5">
          <span className="relative flex h-3 w-3">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                isConnected ? 'bg-green-400' : 'bg-red-400',
              )}
            ></span>
            <span
              className={cn('relative inline-flex rounded-full h-3 w-3', isConnected ? 'bg-green-500' : 'bg-red-500')}
            ></span>
          </span>
        </div>

        <p className={debug ? '' : 'hidden'}>連線狀態：{isConnected ? '成功連線' : '連線失敗'}</p>
        <Button onClick={() => setIsOpen(!isOpen)}>贈訂測試（{isOpen ? '已經顯示' : '點此顯示'}）</Button>
      </div>

      <div className="flex justify-center items-center p-4">
        <motion.div
          initial={{ height: 0 }}
          animate={isOpen ? { height: 'auto' } : { height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex flex-col justify-center items-center">
            <img className="h-auto min-w-32" src={catgrass} alt="" height={127} width={128} />
            <p className="p-4 space-x-4 text-4xl font-bold text-[#d48e26] text-shadow">
              <span>感謝</span>
              <span className="text-[#32c3a6]">ùwú</span>
              <span>種了</span>
              <span className="text-[#32c3a6]">20</span>
              <span>個貓草</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
