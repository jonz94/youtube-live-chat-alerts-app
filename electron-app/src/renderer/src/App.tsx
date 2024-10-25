// import Debug from '~/renderer/components/debug'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
// import Versions from '~/renderer/components/versions'

export default function App() {
  return (
    <div className="min-h-screen grid place-content-center">
      <div className="fixed top-4 right-4">
        <ModeToggle></ModeToggle>
      </div>

      <div>
        <Open></Open>
      </div>

      {/* <Debug></Debug> */}

      {/* <Versions></Versions> */}
    </div>
  )
}
