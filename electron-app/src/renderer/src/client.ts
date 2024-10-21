import { createClient } from '@egoist/tipc/react-query'
// import { type Router } from '../../main/tipc'
import { type Router } from '../../main/types'

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
})
