import { redirect } from "next/navigation";

export default function RetroPage() {
  // Redirect to dashboard page
  redirect("/dashboard");
}