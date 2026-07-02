import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName = "Parceiro";
  let userEmail = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    userName = profile?.full_name ?? user.email ?? "Parceiro";
    userEmail = profile?.email ?? user.email ?? "";
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar variant="parceiro" userName={userName} userEmail={userEmail} />
      <main style={{
        marginLeft: 240, flex: 1, minHeight: "100vh",
        background: "#06080F", padding: "32px 36px", position: "relative",
      }}>
        <div style={{
          position: "fixed", top: 0, right: 0, width: 500, height: 300,
          background: "radial-gradient(ellipse at top right, rgba(255,184,0,.06), transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
