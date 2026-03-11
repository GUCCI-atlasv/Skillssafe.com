// Root path is handled by middleware (IP-based language redirect).
// This file is a fallback in case middleware doesn't catch the request.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
