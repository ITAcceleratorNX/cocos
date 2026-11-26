import { redirect } from "next/navigation";

/** App Router owns `/`, so next.config rewrite to static HTML is ignored — redirect instead. */
export default function Home() {
  redirect("/landing/index.html");
}
