"use client";

import Link from "next/link";
import { useActionState } from "react";
import { atualizarSenhaAction } from "./actions";

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

const inputStyle = {
  width: "100%", padding: "13px 14px", borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 14, fontWeight: 500, outline: "none",
} as const;

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#7A839A",
  marginBottom: 6, display: "block",
} as const;

export default function AtualizarSenhaPage() {
  const [state, action, pending] = useActionState(atualizarSenhaAction, null);

  if (state?.sucesso) {
    return (
      <div>
        <Logo sub="Senha redefinida" />
        <div style={{
          background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.45)",
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "rgba(0,229,138,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>✓</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Senha atualizada!</h2>
          <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 24px" }}>
            Sua senha foi redefinida com sucesso. Faça login com a nova senha.
          </p>
          <Link href="/login" style={{
            display: "block", textAlign: "center", padding: "13px",
            borderRadius: 13, background: "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 14, fontWeight: 800, textDecoration: "none",
          }}>
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Logo sub="Criar nova senha" />
      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.45)",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Definir nova senha
        </h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 22px" }}>
          Escolha uma senha com pelo menos 8 caracteres.
        </p>

        {state?.error && (
          <div style={{
            background: "rgba(255,92,122,.12)", border: "1px solid rgba(255,92,122,.25)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 14,
            fontSize: 13, color: "#FF5C7A",
          }}>
            {state.error}
          </div>
        )}

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Nova senha</label>
            <input name="senha" type="password" required minLength={8} placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input name="confirmar" type="password" required minLength={8} placeholder="••••••••" style={inputStyle} />
          </div>

          <button type="submit" disabled={pending} style={{
            width: "100%", padding: "15px", borderRadius: 13, border: "none",
            background: pending ? "#7A839A" : "linear-gradient(135deg, #FFB800, #FF8A00)",
            color: "#1A1000", fontSize: 15, fontWeight: 800,
            cursor: pending ? "not-allowed" : "pointer",
            boxShadow: pending ? "none" : "0 10px 28px rgba(255,138,0,.28)",
          }}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#7A839A", marginTop: 20 }}>
        <Link href="/login" style={{ color: "#FFB800", fontWeight: 700, textDecoration: "none" }}>
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
