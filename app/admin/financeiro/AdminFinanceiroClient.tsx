"use client";

import { useState, useActionState } from "react";
import { pagarComissaoAction, criarComissaoAction } from "./actions";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

const statusConfig = {
  pago:     { label: "Pago",     color: "#00E58A", bg: "rgba(0,229,138,.12)" },
  pendente: { label: "Pendente", color: "#FFB800", bg: "rgba(255,184,0,.12)" },
} as const;

type Commission = {
  id: string;
  amount: number;
  status: "pago" | "pendente";
  paid_at: string | null;
  project: { id: string; client_name: string; city: string | null; state: string | null } | null;
  partner: { full_name: string; email: string } | null;
};

type Project = {
  id: string;
  client_name: string;
  partner: { full_name: string } | null;
};

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 13, outline: "none",
};

export default function AdminFinanceiroClient({
  commissions,
  projects,
  totalPagar,
  totalPago,
  parceirosAtivos,
}: {
  commissions: Commission[];
  projects: Project[];
  totalPagar: number;
  totalPago: number;
  parceirosAtivos: number;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, action, pending] = useActionState(criarComissaoAction, null);

  if (state?.success && modalOpen) setModalOpen(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Financeiro</h1>
          <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Comissões da rede de parceiros</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: "10px 18px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 13, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 6px 18px rgba(255,138,0,.28)",
          }}
        >
          + Nova comissão
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total gerado",       value: fmt(totalPagar + totalPago), color: "#EAEEF7" },
          { label: "Comissões a pagar",  value: fmt(totalPagar),            color: "#FFB800" },
          { label: "Comissões pagas",    value: fmt(totalPago),             color: "#00E58A" },
          { label: "Parceiros ativos",   value: String(parceirosAtivos),    color: "#2E9BFF" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "18px 20px",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "1px", color: "#7A839A", marginBottom: 8 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: c.color, letterSpacing: "-0.5px" }}>
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
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
            Todas as comissões ({commissions.length})
          </h2>
        </div>

        {commissions.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "#7A839A", fontSize: 13 }}>
            Nenhuma comissão cadastrada ainda.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Parceiro", "Projeto (cliente)", "Valor", "Status", "Data pagamento", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 18px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#7A839A",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissions.map((c, i) => {
                const st = statusConfig[c.status];
                return (
                  <tr key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>{c.partner?.full_name ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#7A839A" }}>{c.partner?.email}</div>
                    </td>
                    <td style={{ padding: "13px 18px", fontSize: 13, color: "#EAEEF7" }}>
                      {c.project?.client_name ?? "—"}
                      {c.project?.city && <span style={{ color: "#7A839A" }}> · {c.project.city}</span>}
                    </td>
                    <td style={{ padding: "13px 18px", fontSize: 14, fontWeight: 900, color: "#FFB800" }}>
                      {fmt(Number(c.amount))}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                        color: st.color, background: st.bg,
                      }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>
                      {fmtDate(c.paid_at)}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      {c.status === "pendente" && (
                        <form action={pagarComissaoAction}>
                          <input type="hidden" name="commission_id" value={c.id} />
                          <button
                            type="submit"
                            style={{
                              padding: "6px 14px", borderRadius: 8, border: "none",
                              background: "rgba(0,229,138,.15)", color: "#00E58A",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            Marcar pago
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nova comissão */}
      {modalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#0E1320", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 18, padding: 28, width: 420,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Nova comissão</h3>
            <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 20px" }}>
              Vincule uma comissão a um projeto existente
            </p>

            {state?.error && (
              <div style={{
                background: "rgba(255,92,122,.12)", border: "1px solid rgba(255,92,122,.25)",
                borderRadius: 10, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: "#FF5C7A",
              }}>
                {state.error}
              </div>
            )}

            <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                  Projeto *
                </label>
                <select name="project_id" required style={{ ...inputStyle, padding: "11px 13px" }}>
                  <option value="">Selecione um projeto...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.client_name}{p.partner ? ` — ${p.partner.full_name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                  Valor da comissão (R$) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ex: 1500.00"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", color: "#7A839A",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  style={{
                    flex: 2, padding: "12px", borderRadius: 12, border: "none",
                    background: pending ? "#7A839A" : "linear-gradient(135deg, #FFB800, #FF8A00)",
                    color: "#1A1000", fontSize: 13, fontWeight: 800,
                    cursor: pending ? "not-allowed" : "pointer",
                  }}
                >
                  {pending ? "Criando..." : "Criar comissão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
