import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr'
import { addTempDonation } from './settings'
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

export function getConnectionState() {
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

  console.log(connection.state)

  await connection.start()

  console.log(connection.state)

  io?.emit('ecpay-connection-state-changed', connection.state)

  hubConnection = connection

  return hubConnection
}

function parseData(data: unknown) {
  if (!Array.isArray(data)) {
    return { error: 'data is not array', data }
  }

  if (data.length < 3) {
    return { error: 'data length < 3', data }
  }

  return {
    error: null,
    data: {
      nickname: data[0] as string,
      price: Number.parseInt(data[1] as string),
      message: data[2] === null ? undefined : (data[2] as string),
    },
  }
}

export function listen(id: string) {
  hubConnection?.on(id, (...data) => {
    const now = Date.now()
    console.log('!!!', data)

    // TODO: parse data as [ 'XXX', '100', '這是一筆贊助測試～' ]
    const { error, data: parsedData } = parseData(data)

    if (error !== null) {
      return
    }

    console.log({ parsedData })

    const { nickname, price, message } = parsedData

    io?.emit('receive-donation', { type: 'ECPAY', to: id, data })

    addTempDonation({
      type: 'ECPAY',
      to: id,
      uniqueId: `ECPAY${now}`,
      nickname,
      price,
      message,
      createdAt: now,
      hide: false,
    })
  })
}

export async function stopEcpayConnection() {
  if (hubConnection === null) {
    return
  }

  await hubConnection.stop()

  hubConnection = null
}
