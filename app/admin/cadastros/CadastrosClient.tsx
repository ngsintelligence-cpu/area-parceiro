"use client";

import { useState, useActionState, useEffect } from "react";
import { aprovarAction, rejeitarAction, criarParceiroAction } from "./actions";

type Status = "pendente" | "aprovado" | "rejeitado";

type Cadastro = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  status: Status;
  created_at: string;
};

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  pendente:  { label: "Pendente",  color: "#FFB800", bg: "rgba(255,184,0,.12)" },
  aprovado:  { label: "Aprovado",  color: "#00E58A", bg: "rgba(0,229,138,.12)" },
  rejeitado: { label: "Rejeitado", color: "#FF5C7A", bg: "rgba(255,92,122,.12)" },
};

const filtros = ["todos", "pendente", "aprovado", "rejeitado"] as const;
type Filtro = (typeof filtros)[number];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#7A839A", marginBottom: 6, display: "block",
};

export default function CadastrosClient({ cadastros }: { cadastros: Cadastro[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalParceiro, setModalParceiro] = useState(false);
  const [stateP, formActionP, pendingP] = useActionState(criarParceiroAction, null);

  useEffect(() => {
    if (stateP?.success) setModalParceiro(false);
  }, [stateP]);

  const visible = filtro === "todos" ? cadastros : cadastros.filter((c) => c.status === filtro);
  const counts = {
    todos: cadastros.length,
    pendente: cadastros.filter((c) => c.status === "pendente").length,
    aprovado: cadastros.filter((c) => c.status === "aprovado").length,
    rejeitado: cadastros.filter((c) => c.status === "rejeitado").length,
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Cadastros</h1>
          <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Gerencie as solicitacoes de acesso ao portal</p>
        </div>
        <button
          onClick={() => setModalParceiro(true)}
          style={{
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 13, fontWeight: 800, cursor: "pointer",
          }}
        >
          + Novo Parceiro
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filtros.map((f) => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
            background: filtro === f ? (f === "todos" ? "#FFB800" : statusConfig[f as Status].color) : "#131A2B",
            color: filtro === f ? "#1A1000" : "#7A839A",
            transition: "all 0.15s",
          }}>
            {f === "todos" ? "Todos" : statusConfig[f as Status].label} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {visible.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7A839A", fontSize: 13 }}>Nenhum cadastro encontrado.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#131A2B" }}>
                {["Nome", "E-mail", "Telefone", "Cidade", "Status", "Cadastro", "Acoes"].map((h) => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7A839A", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#EAEEF7" }}>{c.full_name}</div>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{c.email}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{c.phone ?? "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{c.city && c.state ? `${c.city}, ${c.state}` : (c.city ?? "—")}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, color: statusConfig[c.status].color, background: statusConfig[c.status].bg }}>
                      {statusConfig[c.status].label}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#7A839A" }}>{formatDate(c.created_at)}</td>
                  <td style={{ padding: "13px 18px" }}>
                    {c.status === "pendente" ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <form action={aprovarAction}>
                          <input type="hidden" name="partnerId" value={c.id} />
                          <button type="submit" style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "rgba(0,229,138,.15)", color: "#00E58A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aprovar</button>
                        </form>
                        <button onClick={() => setModalId(c.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "rgba(255,92,122,.12)", color: "#FF5C7A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Rejeitar</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#7A839A" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal rejeição */}
      {modalId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setModalId(null)}>
          <div style={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28, width: 400 }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Rejeitar cadastro</h3>
            <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 18px" }}>Informe o motivo da rejeicao (o parceiro sera notificado por e-mail).</p>
            <form action={rejeitarAction}>
              <input type="hidden" name="partnerId" value={modalId} />
              <textarea name="motivo" required placeholder="Ex: Documentacao incompleta..." rows={4}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0A1020", color: "#EAEEF7", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button type="button" onClick={() => setModalId(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7A839A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "rgba(255,92,122,.20)", color: "#FF5C7A", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Confirmar rejeicao</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Parceiro */}
      {modalParceiro && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setModalParceiro(false)}>
          <div style={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28, width: 460, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Novo Parceiro</h3>
            <p style={{ fontSize: 12, color: "#7A839A", margin: "0 0 20px" }}>Conta criada diretamente como aprovada.</p>
            <form action={formActionP}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input name="full_name" required placeholder="João Silva" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input name="email" type="email" required placeholder="joao@email.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Senha temporária *</label>
                  <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Telefone</label>
                    <input name="phone" placeholder="(11) 99999-9999" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CPF</label>
                    <input name="cpf" placeholder="000.000.000-00" style={inputStyle} />
                  </div>
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
              </div>
              {stateP?.error && <p style={{ color: "#FF5C7A", fontSize: 12, margin: "12px 0 0" }}>{stateP.error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setModalParceiro(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7A839A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={pendingP} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #FFB800, #FF8A00)", color: "#1A1000", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: pendingP ? 0.6 : 1 }}>
                  {pendingP ? "Criando..." : "Criar Parceiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
