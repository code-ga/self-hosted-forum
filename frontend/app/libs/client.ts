import { edenFetch, treaty } from '@elysiajs/eden'
import type { App } from '@/index'

export const client = treaty<App>(import.meta.env.DEV ? 'localhost:3000' : 'self-hosted-forum.nbth.hackclub.app', {
  fetch: {
    credentials: "include",
  }
}) 

export const fetch = edenFetch<App>(import.meta.env.DEV ? 'localhost:3000' : 'self-hosted-forum.nbth.hackclub.app')