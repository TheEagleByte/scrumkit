import { redirect } from "next/navigation";

export default function RetroPage() {
  // Redirect to boards page
  redirect("/boards");
}