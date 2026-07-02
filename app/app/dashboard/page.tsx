import { createClient } from "@/lib/supabase/server";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const stageInfo = [
  { id: "novo_lead",         label: "Novo Lead",         color: "#7A839A" },
  { id: "em_contato",        label: "Em Contato",        color: "#2E9BFF" },
  { id: "proposta_enviada",  label: "Proposta Enviada",  color: "#FFB800" },
  { id: "em_negociacao",     label: "Em Negociação",     color: "#FF8A00" },
  { id: "contrato_assinado", label: "Contrato Assinado", color: "#00E58A" },
  { id: "perdido",           label: "Perdido",           color: "#FF5C7A" },
] as const;

const stageColor: Record<string, string> = Object.fromEntries(stageInfo.map((s) => [s.id, s.color]));
const stageLabel: Record<string, string> = Object.fromEntries(stageInfo.map((s) => [s.id, s.label]));

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let primeiroNome = "Parceiro";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("full_name").eq("id", user.id).single();
    if (profile?.full_name) primeiroNome = profile.full_name.split(" ")[0];
  }

  const [{ data: projetos }, { data: comissoes }] = await Promise.all([
    supabase.from("projects").select("id, client_name, city, state, stage, updated_at"),
    supabase.from("commissions").select("amount, status"),
  ]);

  const lista = projetos ?? [];
  const comm = comissoes ?? [];

  const totalProjetos = lista.length;
  const fechados = lista.filter((p) => p.stage === "contrato_assinado").length;
  const perdidos = lista.filter((p) => p.stage === "perdido").length;
  const decididos = fechados + perdidos;
  const conversao = decididos > 0 ? Math.round((fechados / decididos) * 100) : 0;

  const comissaoPendente = comm.filter((c) => c.status === "pendente").reduce((s, c) => s + Number(c.amount), 0);
  const comissaoPaga = comm.filter((c) => c.status === "pago").reduce((s, c) => s + Number(c.amount), 0);

  const countByStage: Record<string, number> = {};
  for (const p of lista) countByStage[p.stage] = (countByStage[p.stage] ?? 0) + 1;
  const maxStage = Math.max(1, ...Object.values(countByStage));

  const recent = [...lista]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  const stats = [
    { label: "Total de projetos",    value: String(totalProjetos),  sub: `${fechados} fechado${fechados !== 1 ? "s" : ""}`,       color: "#FFB800" },
    { label: "Comissões pendentes",  value: fmt(comissaoPendente),  sub: "Aguardando pagamento",                                   color: "#2E9BFF" },
    { label: "Comissões pagas",      value: fmt(comissaoPaga),      sub: "Acumulado",                                              color: "#00E58A" },
    { label: "Taxa de conversão",    value: `${conversao}%`,        sub: `${fechados}/${decididos} decididos`,                     color: "#FFB800" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          Olá, {primeiroNome} ☀️
        </h1>
        <p style={{ fontSize: 14, color: "#7A839A", margin: 0 }}>
          Aqui está um resumo da sua carteira de projetos.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "#7A839A", marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#7A839A", marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
        {/* Projetos por etapa */}
        <div style={{
          background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: "20px 22px",
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "#EAEEF7" }}>Projetos por etapa</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stageInfo.map((s) => {
              const count = countByStage[s.id] ?? 0;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#7A839A" }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{count}</span>
                  <div style={{ width: 80, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: s.color, width: `${(count / maxStage) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividade recente */}
        <div style={{
          background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: "20px 22px",
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "#EAEEF7" }}>Atividade recente</h2>
          {recent.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#7A839A", fontSize: 13 }}>
              Nenhum projeto ainda. Crie o primeiro em “Projetos”.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recent.map((r) => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10, background: "#131A2B",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: "#FFB800",
                  }}>
                    {r.client_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>{r.client_name}</div>
                    <div style={{ fontSize: 11, color: "#7A839A" }}>
                      {r.city && r.state ? `${r.city}, ${r.state}` : (r.city ?? "—")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      background: `${stageColor[r.stage]}18`, color: stageColor[r.stage], marginBottom: 3,
                    }}>
                      {stageLabel[r.stage]}
                    </div>
                    <div style={{ fontSize: 10, color: "#7A839A" }}>{tempoRelativo(r.updated_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
