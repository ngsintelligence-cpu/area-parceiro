"use client";

import { useState, useActionState } from "react";
import { criarProjetoAction } from "./actions";

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

const ufs = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

type Projeto = {
  id: string;
  client_name: string;
  city: string | null;
  state: string | null;
  power_kwp: number | null;
  value: number | null;
  stage: Stage;
};

const fmt = (v: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
    : "—";

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 13, outline: "none",
};

export default function ProjetosClient({ projetos }: { projetos: Projeto[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, action, pending] = useActionState(criarProjetoAction, null);

  const columns = stages.map((s) => ({
    id: s,
    label: stageLabel[s],
    color: stageColor[s],
    cards: projetos.filter((p) => p.stage === s),
  }));

  const total = projetos.length;

  // Fecha modal ao criar com sucesso
  if (state?.success && modalOpen) setModalOpen(false);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Meus Projetos</h1>
          <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>{total} projeto{total !== 1 ? "s" : ""} no total</p>
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
          + Novo projeto
        </button>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
        {columns.map((col) => (
          <div key={col.id} style={{ minWidth: 240, maxWidth: 240, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 4px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#7A839A", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {col.label}
              </span>
              <span style={{
                marginLeft: "auto", background: `${col.color}20`, color: col.color,
                fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
              }}>{col.cards.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.cards.map((card) => (
                <div key={card.id} style={{
                  background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `3px solid ${col.color}`, borderRadius: 12, padding: "12px 14px",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#EAEEF7", marginBottom: 4 }}>
                    {card.client_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#7A839A", marginBottom: 10 }}>
                    {card.city && card.state ? `${card.city}, ${card.state}` : (card.city ?? "—")}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 11, background: "#131A2B",
                      padding: "3px 8px", borderRadius: 6, color: "#7A839A", fontWeight: 600,
                    }}>
                      {card.power_kwp != null ? `${card.power_kwp} kWp` : "—"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: col.color }}>{fmt(card.value)}</span>
                  </div>
                </div>
              ))}

              {col.cards.length === 0 && (
                <div style={{
                  padding: "20px 0", textAlign: "center",
                  border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 10,
                  color: "#7A839A", fontSize: 11,
                }}>
                  Vazio
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal novo projeto */}
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
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Novo projeto</h3>
            <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 20px" }}>
              Preencha os dados do cliente
            </p>

            {state?.error && (
              <div style={{
                background: "rgba(255,92,122,.12)", border: "1px solid rgba(255,92,122,.25)",
                borderRadius: 10, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: "#FF5C7A",
              }}>
                {state.error}
              </div>
            )}

            <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                  Nome do cliente *
                </label>
                <input name="client_name" type="text" required placeholder="Ex: João Silva" style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                    Cidade
                  </label>
                  <input name="city" type="text" placeholder="Ex: São Paulo" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                    UF
                  </label>
                  <select name="state" style={{ ...inputStyle, width: 70, padding: "11px 8px" }}>
                    <option value="">--</option>
                    {ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                    Potência (kWp)
                  </label>
                  <input name="power_kwp" type="number" step="0.1" min="0" placeholder="Ex: 6.5" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                    Valor (R$)
                  </label>
                  <input name="value" type="number" min="0" placeholder="Ex: 24000" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#7A839A", display: "block", marginBottom: 5 }}>
                  Observações
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Informações adicionais..."
                  style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
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
                  {pending ? "Criando..." : "Criar projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
