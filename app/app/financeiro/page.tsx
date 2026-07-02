import { createClient } from "@/lib/supabase/server";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

const statusConfig = {
  pago:     { label: "Pago",     color: "#00E58A", bg: "rgba(0,229,138,.12)" },
  pendente: { label: "Pendente", color: "#FFB800", bg: "rgba(255,184,0,.12)" },
} as const;

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("commissions")
    .select(`id, amount, status, paid_at, project:projects!project_id(client_name, city, state)`)
    .order("created_at", { ascending: false });

  const comissoes = (raw ?? []).map((c) => ({
    ...c,
    project: Array.isArray(c.project) ? (c.project[0] ?? null) : c.project,
  }));

  const totalPago     = comissoes.filter((c) => c.status === "pago").reduce((s, c) => s + Number(c.amount), 0);
  const totalPendente = comissoes.filter((c) => c.status === "pendente").reduce((s, c) => s + Number(c.amount), 0);
  const totalAcum     = totalPago + totalPendente;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Financeiro</h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Suas comissões e pagamentos</p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total pago",             value: fmt(totalPago),     color: "#00E58A" },
          { label: "Aguardando pagamento",   value: fmt(totalPendente), color: "#FFB800" },
          { label: "Acumulado total",        value: fmt(totalAcum),     color: "#2E9BFF" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 22px",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "#7A839A", marginBottom: 8 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: c.color, letterSpacing: "-1px" }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, overflow: "hidden",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Histórico de comissões</h2>
        </div>

        {comissoes.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "#7A839A", fontSize: 13 }}>
            Nenhuma comissão registrada ainda.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Projeto", "Cidade", "Valor", "Status", "Data de pagamento"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 22px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#7A839A",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c) => {
                const st = statusConfig[c.status as keyof typeof statusConfig];
                const proj = c.project;
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "14px 22px", fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>
                      {proj?.client_name ?? "—"}
                    </td>
                    <td style={{ padding: "14px 22px", fontSize: 13, color: "#7A839A" }}>
                      {proj?.city && proj?.state ? `${proj.city}, ${proj.state}` : (proj?.city ?? "—")}
                    </td>
                    <td style={{ padding: "14px 22px", fontSize: 14, fontWeight: 800, color: "#EAEEF7" }}>
                      {fmt(Number(c.amount))}
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      {st && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                          color: st.color, background: st.bg,
                        }}>
                          {st.label}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 22px", fontSize: 12, color: "#7A839A" }}>
                      {fmtDate(c.paid_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
