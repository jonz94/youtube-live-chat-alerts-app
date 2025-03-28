import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr'
import { io } from './websocket'

const STAGE_ID = 'C1B8B9E32C2467466E4A8B4CE4A99378'
const PRODUCTION_ID = 'A5E64CFE6D354931F52EE1C210452967'

export let hubConnection: HubConnection | null = null

export async function startEcpayConnection(isStage?: boolean) {
  const id = isStage ? STAGE_ID : PRODUCTION_ID

  console.log('ecpay', { id, isStage })

  const response = await fetch(`https://payment${isStage && '-stage'}.ecpay.com.tw/Broadcaster/AlertBox/${id}`)

  if (!response.ok) {
    console.error('fetch alert box page failed')
    process.exit(1)
  }

  const htmlString = await response.text()

  const JwtRegex = /e[yw][A-Za-z0-9-_]+\.(?:e[yw][A-Za-z0-9-_]+)?\.[A-Za-z0-9-_]{2,}(?:(?:\.[A-Za-z0-9-_]{2,}){2})?/g

  const token = htmlString.match(JwtRegex)?.at(0)

  if (!token) {
    console.error('token not found')
    process.exit(1)
  }

  console.log('token:', token)

  const connection = new HubConnectionBuilder()
    .withUrl(`https://signalr${isStage && '-stage'}.ecpay.com.tw/donateHub`, {
      accessTokenFactory: () => token,
    })
    .build()

  await connection.start()

  hubConnection = connection
}

export function listen(id: string) {
  hubConnection?.on(id, (...data) => {
    console.log(data)
    io?.emit('receive-donation', { type: 'ECPAY', to: id, data })
  })
}
