import { useState } from 'react'

export default function Versions() {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul>
      <li>Electron v{versions.electron}</li>
      <li>Chromium v{versions.chrome}</li>
      <li>Node v{versions.node}</li>
    </ul>
  )
}
