import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../database";
import { account, session, user, verification } from "../../database/schema";
export const auth = betterAuth({
  database: drizzleAdapter(db, { // We're using Drizzle as our database
    provider: "pg",
    /*
    * Map your schema into a better-auth schema
    */
    schema: {
      user,
      session,
      verification,
      account,
    },
  }),
  // emailAndPassword: { // we need to verify the email if use this
  //   enabled: true // If you want to use email and password auth
  // },
  socialProviders: {
    /*
    * We're using Google and Github as our social provider, 
    * make sure you have set your environment variables
    */
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  trustedOrigins: ["http://localhost:3000/api/auth", "http://localhost:3000", "http://localhost:5173", "http://localhost:5173/auth/callback", "https://self-hosted-forum.vercel.app", "https://self-hosted-forum.vercel.app/", "https://self-hosted-forum.vercel.app/auth/callback"],
  
});