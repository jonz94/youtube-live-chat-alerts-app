import { DeferQueue } from '@poppinss/defer'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Fragment, useEffect, useState } from 'react'
import { TextEffect } from '~/components/text-effect'
import { Button } from '~/components/ui/button'
import { PORT } from '~/lib/port'
import { cn } from '~/lib/utils'
import { fetchSettings } from '~/query'
import { socket } from '../socket'

interface PresentOptions {
  name: string
  amount: string
  animationTimeInMilliseconds: number
}

const ANIMATION_DURATION_IN_MS = 250
const ENABLE_DEBUG_MODE = false

function convertToDisplayName(id: string | null, lookupTable: { name: string; amount: string }) {
  if (id !== 'name' && id !== 'amount') {
    return null
  }

  return lookupTable[id]
}

const queue = new DeferQueue({ concurrency: 1 })

queue.onError = function (error, task) {
  console.log(`${task.name} task failed with the following error`)
  console.log(error)
}

queue.taskAdded = function (task) {
  console.log(`${task.name} added. ${String(queue.size())} tasks left`)
}

queue.taskCompleted = function (task) {
  console.log(`${task.name} completed. ${String(queue.size())} tasks left`)
}

queue.drained = function () {
  console.log('Processed last task in the queue')
}

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [name, setName] = useState('測試贊助者')
  const [amount, setAmount] = useState('87')
  const [isOpen, setIsOpen] = useState(false)
  const [debug] = useState(ENABLE_DEBUG_MODE)
  const [cacheTimestamp, setCacheTimestamp] = useState(String(Date.now()))
  const {
    data: settings,
    error,
    isLoading,
    refetch: refetchSettings,
  } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  function present({ name, amount, animationTimeInMilliseconds }: PresentOptions) {
    function task() {
      return new Promise((resolve) => {
        setName(name)
        setAmount(amount)
        setIsOpen(true)

        setTimeout(() => {
          setIsOpen(false)

          setTimeout(() => resolve(undefined), ANIMATION_DURATION_IN_MS)
        }, animationTimeInMilliseconds)
      })
    }

    queue.push(task)
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onOpen({ name, amount, animationTimeInMilliseconds }: PresentOptions) {
      present({ name, amount, animationTimeInMilliseconds })
    }

    function onUpdate() {
      setCacheTimestamp(String(Date.now()))
    }

    function onTemplateUpdated() {
      void refetchSettings()
    }

    socket.on('connect', onConnect)
    socket.on('open', onOpen)
    socket.on('update', onUpdate)
    socket.on('template-updated', onTemplateUpdated)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('open', onOpen)
      socket.off('update', onUpdate)
      socket.off('template-updated', onTemplateUpdated)
      socket.off('disconnect', onDisconnect)
    }
  }, [isOpen, refetchSettings])

  if (isLoading) {
    return <>設定載入中...</>
  }

  if (error) {
    return (
      <>
        <p>載入設定時發生錯誤！</p>
        <p>詳細錯誤訊息如下：</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </>
    )
  }

  if (!settings) {
    return <>載入設定時發生錯誤：設定資料空空如也</>
  }

  return (
    <div className="min-h-screen">
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
        <Button onClick={() => present({ name: '測試', amount: '87', animationTimeInMilliseconds: 5000 })}>
          贈訂測試
        </Button>
        <Button onClick={() => setIsOpen(!isOpen)}>DEBUG: {isOpen ? '已經顯示' : '點此顯示'}</Button>
      </div>

      <div className="flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ height: 0 }}
          animate={isOpen ? { height: 'auto' } : { height: 0 }}
          transition={{ duration: ANIMATION_DURATION_IN_MS / 1000, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex flex-col justify-center items-center">
            <img
              className="h-auto w-[400px]"
              src={`http://localhost:${PORT}/assets/image${amount === '87' ? '1' : amount}.gif?t=${cacheTimestamp}`}
              alt=""
            />

            {/*
              NOTE: the `isOpen` check ensures the element is only rendered when active,
              allowing CSS animations to reset properly by removing it from the DOM when closed
            */}
            {isOpen && (
              <p className="p-4 text-4xl font-bold text-[#d48e26] text-shadow break-all">
                {settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate.map((item, index) => {
                  if (item.type === 'text') {
                    return <Fragment key={`block-${index}`}>{item.text}</Fragment>
                  }

                  return (
                    <span key={`block-${index}`} className="text-[#32c3a6] inline-flex px-2">
                      <TextEffect animate="bounce">
                        {convertToDisplayName(item.attrs.id, { name, amount }) ?? 'null'}
                      </TextEffect>
                    </span>
                  )
                })}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
