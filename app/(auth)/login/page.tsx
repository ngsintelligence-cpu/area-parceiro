"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg, #FFB800, #FF8A00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, boxShadow: "0 8px 26px rgba(255,138,0,.35)",
        }}>☀️</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#EAEEF7" }}>Power Mais</div>
          <div style={{ fontSize: 11, color: "#7A839A", marginTop: 1 }}>Área do Parceiro</div>
        </div>
      </div>

      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.45)",
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>
          Entrar na sua conta
        </h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 24px" }}>
          Acesse o portal de parceiros Power Mais
        </p>

        {state?.error && (
          <div style={{
            background: "rgba(255,92,122,.12)", border: "1px solid rgba(255,92,122,.25)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            fontSize: 13, color: "#FF5C7A",
          }}>
            {state.error}
          </div>
        )}

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A839A", marginBottom: 6, display: "block" }}>
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              style={{
                width: "100%", padding: "13px 14px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0A1020", color: "#EAEEF7",
                fontSize: 14, fontWeight: 500, outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#7A839A", marginBottom: 6, display: "block" }}>
              Senha
            </label>
            <input
              name="senha"
              type="password"
              required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "13px 14px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0A1020", color: "#EAEEF7",
                fontSize: 14, fontWeight: 500, outline: "none",
              }}
            />
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <Link href="/recuperar-senha" style={{ fontSize: 12, color: "#7A839A", textDecoration: "none" }}>
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            style={{
              width: "100%", padding: "15px", borderRadius: 13, border: "none",
              background: pending ? "#7A839A" : "linear-gradient(135deg, #FFB800, #FF8A00)",
              color: "#1A1000", fontSize: 15, fontWeight: 800,
              cursor: pending ? "not-allowed" : "pointer",
              boxShadow: pending ? "none" : "0 10px 28px rgba(255,138,0,.28)",
              transition: "all 0.15s",
            }}
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#7A839A", marginTop: 20 }}>
        Ainda nao e parceiro?{" "}
        <Link href="/cadastro" style={{ color: "#FFB800", fontWeight: 700, textDecoration: "none" }}>
          Solicite seu acesso
        </Link>
      </p>
    </div>
  );
}
