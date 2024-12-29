import { Innertube } from 'youtubei.js'

let client: Innertube | null = null

export async function getInnertubeClient() {
  if (client) {
    return client
  }

  client = await Innertube.create()

  return client
}
