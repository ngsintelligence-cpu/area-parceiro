"use client";

import { useState, useTransition } from "react";
import { mudarEtapaAction } from "./actions";

const stages = ["novo_lead","em_contato","proposta_enviada","em_negociacao","contrato_assinado","perdido"] as const;
type Stage = typeof stages[number];

const stageLabel: Record<Stage, string> = {
  novo_lead: "Novo Lead",
  em_contato: "Em Contato",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociacao",
  contrato_assinado: "Contrato Assinado",
  perdido: "Perdido",
};
const stageColor: Record<Stage, string> = {
  novo_lead: "#7A839A",
  em_contato: "#2E9BFF",
  proposta_enviada: "#FFB800",
  em_negociacao: "#FF8A00",
  contrato_assinado: "#00E58A",
  perdido: "#FF5C7A",
};

type Projeto = {
  id: string;
  client_name: string;
  city: string | null;
  state: string | null;
  power_kwp: number | null;
  value: number | null;
  stage: Stage;
  partner: { full_name: string; email: string } | null;
};

const fmt = (v: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
    : "—";

export default function ProjetosClient({ projetos: initial }: { projetos: Projeto[] }) {
  const [projetos, setProjetos] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleStageChange = (projectId: string, newStage: Stage) => {
    setProjetos((prev) => prev.map((p) => p.id === projectId ? { ...p, stage: newStage } : p));
    setEditingId(null);
    startTransition(() => {
      mudarEtapaAction(projectId, newStage);
    });
  };

  const counts = stages.reduce((acc, s) => ({ ...acc, [s]: projetos.filter((p) => p.stage === s).length }), {} as Record<Stage, number>);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Projetos</h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Visao geral de todos os projetos da rede</p>
      </div>

      {/* Stage summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {stages.map((s) => (
          <div key={s} style={{
            background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor[s] }} />
            <span style={{ fontSize: 12, color: "#7A839A" }}>{stageLabel[s]}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: stageColor[s] }}>{counts[s]}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, overflow: "hidden",
      }}>
        {projetos.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7A839A", fontSize: 13 }}>
            Nenhum projeto ainda.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Cliente", "Parceiro", "Cidade", "Potencia", "Valor", "Etapa"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 18px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#7A839A",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projetos.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>{p.client_name}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{p.partner?.full_name ?? "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>
                    {p.city && p.state ? `${p.city}, ${p.state}` : (p.city ?? "—")}
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>
                    {p.power_kwp != null ? `${p.power_kwp} kWp` : "—"}
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 800, color: "#EAEEF7" }}>{fmt(p.value)}</td>
                  <td style={{ padding: "13px 18px" }}>
                    {editingId === p.id ? (
                      <select
                        defaultValue={p.stage}
                        autoFocus
                        onBlur={() => setEditingId(null)}
                        onChange={(e) => handleStageChange(p.id, e.target.value as Stage)}
                        style={{
                          padding: "6px 10px", borderRadius: 8,
                          border: `1px solid ${stageColor[p.stage]}`,
                          background: "#131A2B", color: "#EAEEF7",
                          fontSize: 12, outline: "none", cursor: "pointer",
                        }}
                      >
                        {stages.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingId(p.id)}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                          color: stageColor[p.stage],
                          background: `${stageColor[p.stage]}18`,
                          border: "none", cursor: "pointer",
                        }}
                      >
                        {stageLabel[p.stage]} ↓
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
