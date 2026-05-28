import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <LoginFormWrapper searchParamsPromise={searchParams} />;
}

async function LoginFormWrapper({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ next?: string }>;
}) {
  const sp = await searchParamsPromise;
  return <LoginForm next={sp.next} />;
}
