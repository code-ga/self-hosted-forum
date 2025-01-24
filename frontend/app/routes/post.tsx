import ViewPost from "../post/ViewPost";
import type { Route } from "./+types/post";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Post() {
   
  return <ViewPost />;
}
