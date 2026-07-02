"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { mudarEtapaAction, criarProjetoAdminAction } from "./actions";

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

type Parceiro = { id: string; full_name: string; email: string };

const fmt = (v: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
    : "—";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#7A839A", marginBottom: 6, display: "block",
};

export default function ProjetosClient({ projetos: initial, parceiros }: { projetos: Projeto[]; parceiros: Parceiro[] }) {
  const [projetos, setProjetos] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [modalAberto, setModalAberto] = useState(false);
  const [state, formAction, pending] = useActionState(criarProjetoAdminAction, null);

  useEffect(() => {
    if (state?.success) setModalAberto(false);
  }, [state]);

  const handleStageChange = (projectId: string, newStage: Stage) => {
    setProjetos((prev) => prev.map((p) => p.id === projectId ? { ...p, stage: newStage } : p));
    setEditingId(null);
    startTransition(() => { mudarEtapaAction(projectId, newStage); });
  };

  const counts = stages.reduce((acc, s) => ({ ...acc, [s]: projetos.filter((p) => p.stage === s).length }), {} as Record<Stage, number>);

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Projetos</h1>
          <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Visao geral de todos os projetos da rede</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 13, fontWeight: 800, cursor: "pointer",
          }}
        >
          + Novo Projeto
        </button>
      </div>

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

      <div style={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {projetos.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7A839A", fontSize: 13 }}>Nenhum projeto ainda.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Cliente", "Parceiro", "Cidade", "Potencia", "Valor", "Etapa"].map((h) => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7A839A", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projetos.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>{p.client_name}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{p.partner?.full_name ?? "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{p.city && p.state ? `${p.city}, ${p.state}` : (p.city ?? "—")}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{p.power_kwp != null ? `${p.power_kwp} kWp` : "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 800, color: "#EAEEF7" }}>{fmt(p.value)}</td>
                  <td style={{ padding: "13px 18px" }}>
                    {editingId === p.id ? (
                      <select defaultValue={p.stage} autoFocus onBlur={() => setEditingId(null)} onChange={(e) => handleStageChange(p.id, e.target.value as Stage)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${stageColor[p.stage]}`, background: "#131A2B", color: "#EAEEF7", fontSize: 12, outline: "none", cursor: "pointer" }}>
                        {stages.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditingId(p.id)}
                        style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, color: stageColor[p.stage], background: `${stageColor[p.stage]}18`, border: "none", cursor: "pointer" }}>
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

      {/* Modal Novo Projeto */}
      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setModalAberto(false)}>
          <div style={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28, width: 440 }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 20px" }}>Novo Projeto</h3>
            <form action={formAction}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Parceiro *</label>
                  <select name="partner_id" required style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Selecione o parceiro</option>
                    {parceiros.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nome do Cliente *</label>
                  <input name="client_name" required placeholder="João Silva" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Cidade</label>
                    <input name="city" placeholder="São Paulo" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <input name="state" placeholder="SP" maxLength={2} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Etapa inicial</label>
                  <select name="stage" style={{ ...inputStyle, cursor: "pointer" }}>
                    {stages.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
                  </select>
                </div>
              </div>
              {state?.error && <p style={{ color: "#FF5C7A", fontSize: 12, margin: "12px 0 0" }}>{state.error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7A839A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={pending} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #FFB800, #FF8A00)", color: "#1A1000", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
                  {pending ? "Criando..." : "Criar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
