"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cadastroAction } from "./actions";

const ufs = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0A1020", color: "#EAEEF7",
  fontSize: 14, fontWeight: 500, outline: "none",
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#7A839A", marginBottom: 6, display: "block",
} as const;

export default function CadastroPage() {
  const [state, action, pending] = useActionState(cadastroAction, null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg, #FFB800, #FF8A00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, boxShadow: "0 8px 26px rgba(255,138,0,.35)",
        }}>☀️</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#EAEEF7" }}>Power Mais</div>
          <div style={{ fontSize: 11, color: "#7A839A", marginTop: 1 }}>Solicitar acesso de parceiro</div>
        </div>
      </div>

      <div style={{
        background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.45)",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Crie sua conta
        </h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: "0 0 22px" }}>
          Seu cadastro sera analisado pela equipe Power Mais
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

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input name="nome" type="text" required placeholder="Seu nome" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input name="email" type="email" required placeholder="seu@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefone</label>
              <input name="telefone" type="tel" required placeholder="(11) 99999-9999" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>CPF</label>
            <input name="cpf" type="text" required placeholder="000.000.000-00" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input name="cidade" type="text" required placeholder="Sua cidade" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>UF</label>
              <select name="estado" required style={{ ...inputStyle, width: 72, padding: "12px 10px" }}>
                <option value="">UF</option>
                {ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Senha</label>
            <input name="senha" type="password" required placeholder="Minimo 8 caracteres" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar senha</label>
            <input name="confirmar" type="password" required placeholder="Repita a senha" style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={pending}
            style={{
              display: "block", textAlign: "center",
              padding: "15px", borderRadius: 13, marginTop: 6, border: "none",
              background: pending ? "#7A839A" : "linear-gradient(135deg, #FFB800, #FF8A00)",
              color: "#1A1000", fontSize: 15, fontWeight: 800,
              cursor: pending ? "not-allowed" : "pointer",
              boxShadow: pending ? "none" : "0 10px 28px rgba(255,138,0,.28)",
            }}
          >
            {pending ? "Enviando..." : "Solicitar acesso"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#7A839A", marginTop: 20 }}>
        Ja tem conta?{" "}
        <Link href="/login" style={{ color: "#FFB800", fontWeight: 700, textDecoration: "none" }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
