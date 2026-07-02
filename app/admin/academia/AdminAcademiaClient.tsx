"use client";

import { useState, useActionState } from "react";
import { criarConteudoAction, toggleStatusAction, deletarConteudoAction } from "./actions";

const categoriaLabel: Record<string, string> = {
  fundamentos_solar: "Fundamentos Solar",
  tecnicas_venda: "Técnicas de Venda",
  financiamento: "Financiamento",
};

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  ativo:   { label: "Ativo",   color: "#00E58A", bg: "rgba(0,229,138,.12)" },
  inativo: { label: "Inativo", color: "#7A839A", bg: "rgba(122,131,154,.12)" },
};

const tipoCfg: Record<string, { label: string; color: string }> = {
  video: { label: "Vídeo", color: "#FFB800" },
  pdf:   { label: "PDF",   color: "#2E9BFF" },
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

type Conteudo = {
  id: string;
  title: string;
  category: string;
  type: string;
  status: string;
  url: string | null;
  created_at: string;
};

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 13, outline: "none",
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "#7A839A",
  display: "block", marginBottom: 5,
} as const;

export default function AdminAcademiaClient({ conteudos }: { conteudos: Conteudo[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, action, pending] = useActionState(criarConteudoAction, null);

  if (state?.success && modalOpen) setModalOpen(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Academia</h1>
          <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Gerenciar conteúdos de treinamento</p>
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
          + Novo conteúdo
        </button>
      </div>

      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, overflow: "hidden",
      }}>
        {conteudos.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "#7A839A", fontSize: 13 }}>
            Nenhum conteúdo cadastrado ainda.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Título", "Categoria", "Tipo", "Status", "Criado em", "Ações"].map((h) => (
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
              {conteudos.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: "#EAEEF7", textDecoration: "none" }}>
                        {c.title}
                      </a>
                    ) : c.title}
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>
                    {categoriaLabel[c.category] ?? c.category}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                      color: tipoCfg[c.type]?.color, background: `${tipoCfg[c.type]?.color}18`,
                    }}>
                      {tipoCfg[c.type]?.label ?? c.type}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                      color: statusCfg[c.status]?.color, background: statusCfg[c.status]?.bg,
                    }}>
                      {statusCfg[c.status]?.label ?? c.status}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{fmtDate(c.created_at)}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <form action={toggleStatusAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="status" value={c.status} />
                        <button type="submit" style={{
                          padding: "5px 12px", borderRadius: 8, border: "none",
                          background: c.status === "ativo" ? "rgba(122,131,154,.15)" : "rgba(0,229,138,.15)",
                          color: c.status === "ativo" ? "#7A839A" : "#00E58A",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>
                          {c.status === "ativo" ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <form action={deletarConteudoAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={{
                          padding: "5px 12px", borderRadius: 8,
                          border: "1px solid rgba(255,92,122,0.2)",
                          background: "transparent", color: "#FF5C7A",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal novo conteúdo */}
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
              borderRadius: 18, padding: 28, width: 440,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Novo conteúdo</h3>
            <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 20px" }}>
              Cole o link do vídeo (YouTube/Vimeo) ou do PDF
            </p>

            {state?.error && (
              <div style={{
                background: "rgba(255,92,122,.12)", border: "1px solid rgba(255,92,122,.25)",
                borderRadius: 10, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: "#FF5C7A",
              }}>
                {state.error}
              </div>
            )}

            <form action={action} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input name="title" type="text" required placeholder="Ex: Como dimensionar um sistema" style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select name="category" required style={inputStyle}>
                    <option value="fundamentos_solar">Fundamentos Solar</option>
                    <option value="tecnicas_venda">Técnicas de Venda</option>
                    <option value="financiamento">Financiamento</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tipo *</label>
                  <select name="type" required style={inputStyle}>
                    <option value="video">Vídeo</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Link (URL) *</label>
                <input name="url" type="url" required placeholder="https://..." style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Duração em minutos (opcional)</label>
                <input name="duration_min" type="number" min="0" placeholder="Ex: 12" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Descrição (opcional)</label>
                <textarea name="description" rows={2} placeholder="Breve descrição..." style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "#7A839A",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={pending} style={{
                  flex: 2, padding: "12px", borderRadius: 12, border: "none",
                  background: pending ? "#7A839A" : "linear-gradient(135deg, #FFB800, #FF8A00)",
                  color: "#1A1000", fontSize: 13, fontWeight: 800,
                  cursor: pending ? "not-allowed" : "pointer",
                }}>
                  {pending ? "Salvando..." : "Salvar conteúdo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
