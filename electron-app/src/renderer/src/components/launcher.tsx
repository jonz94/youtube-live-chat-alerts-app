import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/renderer/components/ui/card'

export function Launcher({ isDev }: { isDev: boolean }) {
  return (
    <a
      href={isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
      target="_blank"
      rel="noreferrer"
    >
      <Card>
        <CardHeader>
          <CardTitle>瀏覽器顯示</CardTitle>
          <CardDescription>此視窗可作為 OBS 輸入源</CardDescription>
        </CardHeader>
        <CardContent>
          <p>✨ 可直接用滑鼠拖曳此方框、然後丟進 OBS 視窗內</p>
        </CardContent>
      </Card>
    </a>
  )
}
