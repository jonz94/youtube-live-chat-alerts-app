import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { cn } from '~/renderer/lib/utils'

export function Launcher({ name, url }: { name?: string; url: string }) {
  const [isGrabbing, setIsGrabbing] = useState(false)

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn('cursor-grab', isGrabbing && 'cursor-grabbing')}
      onClick={(e) => e.preventDefault()}
      onMouseDown={() => setIsGrabbing(true)}
      onMouseUp={() => setIsGrabbing(false)}
      onDragStart={() => setIsGrabbing(false)}
    >
      <Card className="hover:border-primary hover:bg-primary/10">
        <CardHeader>
          <CardTitle>瀏覽器顯示{name ? `（${name}）` : ''}</CardTitle>
          <CardDescription>此視窗可作為 OBS 輸入源</CardDescription>
        </CardHeader>
        <CardContent>
          <p>✨ 可直接用滑鼠拖曳此方框、然後丟進 OBS 視窗內</p>
        </CardContent>
      </Card>
    </a>
  )
}
