import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const Logo = ({ sub }: { sub: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 13,
      background: "linear-gradient(135deg, #FFB800, #FF8A00)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, boxShadow: "0 8px 26px rgba(255,138,0,.35)",
    }}>☀️</div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#EAEEF7" }}>Power Mais</div>
      <div style={{ fontSize: 11, color: "#7A839A", marginTop: 1 }}>{sub}</div>
    </div>
  </div>
);

const cardStyle = {
  background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20, padding: 32, boxShadow: "0 18px 50px rgba(0,0,0,.45)",
  textAlign: "center" as const,
};

const voltarLogin = (
  <Link href="/login" style={{
    display: "block", textAlign: "center", padding: "13px",
    borderRadius: 13, border: "1px solid rgba(255,255,255,0.08)",
    color: "#7A839A", fontSize: 14, fontWeight: 700, textDecoration: "none",
  }}>
    Voltar ao login
  </Link>
);

export default async function CadastroEmAnalisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let status: string | null = null;
  let rejectionReason: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, rejection_reason")
      .eq("id", user.id)
      .single();
    status = profile?.status ?? null;
    rejectionReason = profile?.rejection_reason ?? null;
  }

  // ── Rejeitado ──────────────────────────────────────────────
  if (status === "rejeitado") {
    return (
      <div>
        <Logo sub="Cadastro não aprovado" />
        <div style={cardStyle}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
            background: "rgba(255,92,122,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          }}>✕</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.4px" }}>
            Cadastro não aprovado
          </h1>
          <p style={{ fontSize: 14, color: "#7A839A", margin: "0 0 20px", lineHeight: 1.6 }}>
            Infelizmente sua solicitação de acesso não foi aprovada.
          </p>
          {rejectionReason && (
            <div style={{
              background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.2)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 24, textAlign: "left",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF5C7A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Motivo
              </div>
              <div style={{ fontSize: 13, color: "#EAEEF7", lineHeight: 1.5 }}>{rejectionReason}</div>
            </div>
          )}
          {voltarLogin}
        </div>
      </div>
    );
  }

  // ── Aprovado (caiu aqui por engano) ────────────────────────
  if (status === "aprovado") {
    return (
      <div>
        <Logo sub="Acesso liberado" />
        <div style={cardStyle}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
            background: "rgba(0,229,138,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.4px" }}>
            Acesso liberado!
          </h1>
          <p style={{ fontSize: 14, color: "#7A839A", margin: "0 0 24px", lineHeight: 1.6 }}>
            Seu cadastro foi aprovado. Você já pode acessar o portal.
          </p>
          <Link href="/app/dashboard" style={{
            display: "block", textAlign: "center", padding: "13px",
            borderRadius: 13, background: "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 14, fontWeight: 800, textDecoration: "none",
          }}>
            Entrar no portal
          </Link>
        </div>
      </div>
    );
  }

  // ── Pendente / sem login (padrão) ──────────────────────────
  return (
    <div>
      <Logo sub="Cadastro enviado" />
      <div style={cardStyle}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
          background: "rgba(255,184,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        }}>⏳</div>

        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.4px" }}>
          Cadastro em análise
        </h1>
        <p style={{ fontSize: 14, color: "#7A839A", margin: "0 0 24px", lineHeight: 1.6 }}>
          Recebemos sua solicitação e nossa equipe está analisando seus dados.
          Você receberá um e-mail quando seu acesso for liberado.
        </p>

        <div style={{
          background: "#131A2B", borderRadius: 12, padding: "14px 16px",
          marginBottom: 24, textAlign: "left",
        }}>
          {[
            "Análise realizada em até 1 dia útil",
            "Você será notificado por e-mail",
            "Em caso de rejeição, o motivo será informado",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <span style={{ color: "#00E58A", fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13, color: "#7A839A" }}>{item}</span>
            </div>
          ))}
        </div>

        {voltarLogin}
      </div>
    </div>
  );
}
