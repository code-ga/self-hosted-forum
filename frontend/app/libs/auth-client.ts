import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV ? "http://localhost:3000" : "https://self-hosted-forum.nbth.hackclub.app", // the base url of your auth server
  fetchOptions: {
    credentials: "include"
  }
})