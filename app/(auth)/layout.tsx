import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthMarketingFooter } from "@/components/auth/auth-marketing-footer";
import { AuthStatsBar } from "@/components/auth/auth-stats-bar";
import { Logo } from "@/components/layout/logo";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { count: membersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="grid lg:grid-cols-2">
        <AuthBrandPanel />

        <div className="flex min-h-[720px] flex-col items-center justify-center px-4 py-10 sm:px-8 lg:min-h-screen lg:py-12">
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>
          <div className="w-full max-w-[440px] rounded-[1.75rem] border border-zinc-100 bg-white p-8 shadow-[0_20px_60px_rgb(15_23_42/0.08)] sm:p-9">
            {children}
          </div>
        </div>
      </div>

      <AuthStatsBar membersCount={membersCount ?? 0} />
      <AuthMarketingFooter />
    </div>
  );
}
