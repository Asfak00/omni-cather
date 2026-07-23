import { redirect } from "next/navigation";

/** Docs now live on the event view — keep old links working */
export default async function LegacyDocsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/events/${id}?tab=docs`);
}
