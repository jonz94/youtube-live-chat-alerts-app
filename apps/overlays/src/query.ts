import { z } from 'zod'
import { settingsSchema } from '~/lib/schema'

const livechatSchema = z.object({
  videoId: z.string(),
})

export type LivechatSchema = z.infer<typeof livechatSchema>

export const fetchLivechatData = (videoId: string) => {
  return async () => {
    const content = await fetch(`http://localhost:21829/api/live-chat/${videoId}`).then((response) => response.text())
    const parsedData = await livechatSchema.parseAsync(JSON.parse(content))

    return parsedData
  }
}

export async function fetchSettings() {
  const content = await fetch('http://localhost:21829/api/settings').then((response) => response.text())
  const parsedData = await settingsSchema.parseAsync(JSON.parse(content))

  return parsedData
}
