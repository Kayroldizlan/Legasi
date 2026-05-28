import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Search" };

export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  redirect(`/directory${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ""}`);
}
