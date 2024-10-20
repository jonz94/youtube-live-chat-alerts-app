import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Button } from '~/renderer/components/ui/button'
import Versions from '~/renderer/components/versions'

export default function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <div className="min-h-screen grid place-content-center">
      <Button onClick={ipcHandle}>Send IPC</Button>

      <ModeToggle></ModeToggle>

      <Versions></Versions>
    </div>
  )
}
