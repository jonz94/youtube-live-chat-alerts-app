import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Livechat } from '~/livechat'
import { cn } from './lib/utils'
import { socket } from './socket'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [name, setName] = useState('測試')
  const [amount, setAmount] = useState('87')
  const [isOpen, setIsOpen] = useState(false)
  const [debug] = useState(true)

  function present({ name, amount }: { name: string; amount: string }) {
    setName(name)
    setAmount(amount)
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

    function onOpen({ name, amount }: { name: string; amount: string }) {
      if (isOpen) {
        return
      }

      present({ name, amount })
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
      <div>{debug && isConnected ? <Livechat></Livechat> : null}</div>

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
        <Button onClick={() => present({ name: '測試', amount: '87' })}>贈訂測試</Button>
        <Button onClick={() => setIsOpen(!isOpen)}>DEBUG: {isOpen ? '已經顯示' : '點此顯示'}</Button>
      </div>

      <div className="flex justify-center items-center p-4">
        <motion.div
          initial={{ height: 0 }}
          animate={isOpen ? { height: 'auto' } : { height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex flex-col justify-center items-center">
            <img
              className="h-auto min-w-32"
              src={`${import.meta.env.BASE_URL}/catgrass.png`}
              alt=""
              height={127}
              width={128}
            />
            <p className="p-4 space-x-4 text-4xl font-bold text-[#d48e26] text-shadow">
              <span>感謝</span>
              <span className="text-[#32c3a6]">{name}</span>
              <span>種了</span>
              <span className="text-[#32c3a6]">{amount}</span>
              <span>個貓草</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
