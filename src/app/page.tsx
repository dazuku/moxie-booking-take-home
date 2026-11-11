import { redirect } from "next/navigation";

// The exercise has a single practice; send the root URL to its booking page.
export default function Home() {
  redirect("/booking/gold-spa");
}
