import { redirect } from "next/navigation";

// Redirect /dashboard to / which uses the (dashboard) layout with sidebar + header
export default function DashboardRedirect() {
  redirect("/");
}
