import { Card, CardContent, CardHeader, CardTitle } from '~/renderer/components/ui/card'

export function PleaseReopen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>安裝成功！</CardTitle>
      </CardHeader>
      <CardContent>
        <p>✨ 已成功在桌面上建立捷徑</p>
        <p>✨ 您現在可以放心關閉此安裝程式</p>
      </CardContent>
    </Card>
  )
}
