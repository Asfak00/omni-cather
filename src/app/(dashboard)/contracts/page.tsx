import { redirect } from "next/navigation";

/** Contracts are managed from the Events list now */
export default function LegacyContractsPage() {
  redirect("/events");
}
