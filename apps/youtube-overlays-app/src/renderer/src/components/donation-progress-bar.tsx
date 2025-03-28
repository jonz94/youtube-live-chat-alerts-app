import { useState } from 'react'
import { Progress } from '~/renderer/components/ui/progress'

const TARGET = 100_000

export function DonationProgressBar() {
  const [progress] = useState(0)

  const progressBarValue = (progress / TARGET) * 100

  console.log(progress, progressBarValue)

  return (
    <div className="mt-8 w-full px-4 flex flex-col gap-y-1 flex-1">
      <p className="px-2">
        進度條 {progress}/{TARGET}
      </p>
      <Progress value={progressBarValue}></Progress>
    </div>
  )
}
