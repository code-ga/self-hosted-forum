import type { Route } from "./+types/login";
import LoginPage from "../auth/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forum Login" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function Home() {
  return <LoginPage />;
}
