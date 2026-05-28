import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { AUTH_LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url), {
    status: 302,
  });
}
