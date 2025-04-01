import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr'
import { io } from './websocket'

let hubConnection: HubConnection | null = null

export async function getToken(id: string, isStage = false) {
  try {
    const response = await fetch(
      `https://${isStage ? 'payment-stage' : 'payment'}.ecpay.com.tw/Broadcaster/AlertBox/${id}`,
    )

    if (!response.ok) {
      return { error: '網址連線失敗', token: null }
    }

    const htmlString = await response.text()

    if (htmlString.includes(`alert('連結錯誤');`)) {
      return { error: '連結錯誤', token: null }
    }

    const JwtRegex = /e[yw][A-Za-z0-9-_]+\.(?:e[yw][A-Za-z0-9-_]+)?\.[A-Za-z0-9-_]{2,}(?:(?:\.[A-Za-z0-9-_]{2,}){2})?/g

    const token = htmlString.match(JwtRegex)?.at(0) ?? null

    return { error: null, token }
  } catch (error) {
    console.error(error)

    return { error: '發生錯誤', token: null }
  }
}

export function getConnectionStatus() {
  if (hubConnection === null) {
    return null
  }

  return hubConnection.state
}

export async function startEcpayConnection(token: string, isStage = false) {
  if (hubConnection) {
    return hubConnection
  }

  const connection = new HubConnectionBuilder()
    .withUrl(`https://${isStage ? 'signalr-stage' : 'signalr'}.ecpay.com.tw/donateHub`, {
      accessTokenFactory: () => token,
    })
    .build()

  console.log(connection.state)

  await connection.start()

  console.log(connection.state)

  io?.emit('ecpay-connection-state-changed', connection.state)

  connection.onclose((error) => {
    const state = connection.state
    console.log('on close.', 'has error?', !!error)
    console.log(state)
    console.error(error)
    hubConnection = null
    io?.emit('ecpay-connection-state-changed', state)
  })
  connection.onreconnected(() => {
    const state = connection.state
    console.log('on reconnected.')
    console.log(state)
    io?.emit('ecpay-connection-state-changed', state)
  })
  connection.onreconnecting(() => {
    const state = connection.state
    console.log('on reconnecting.')
    console.log(state)
    io?.emit('ecpay-connection-state-changed', state)
  })

  hubConnection = connection

  return hubConnection
}

export function listen(id: string) {
  hubConnection?.on(id, (...data) => {
    console.log(data)
    io?.emit('receive-donation', { type: 'ECPAY', to: id, data })
  })
}

export async function stopEcpayConnection() {
  if (hubConnection === null) {
    return
  }

  await hubConnection.stop()

  hubConnection = null
}
