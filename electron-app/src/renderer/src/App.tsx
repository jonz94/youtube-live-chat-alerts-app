import Debug from '~/renderer/components/debug'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import Versions from '~/renderer/components/versions'
import VideoInfo from '~/renderer/components/video-info'

export default function App() {
  return (
    <div className="min-h-screen grid place-content-center">
      <VideoInfo></VideoInfo>

      <ModeToggle></ModeToggle>

      <Debug></Debug>

      <Versions></Versions>
    </div>
  )
}
