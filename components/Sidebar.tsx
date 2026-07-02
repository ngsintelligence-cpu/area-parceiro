"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

const parceiroNav: NavItem[] = [
  { href: "/app/dashboard",  label: "Dashboard",   icon: "⊞" },
  { href: "/app/projetos",   label: "Projetos",     icon: "◫" },
  { href: "/app/financeiro", label: "Financeiro",   icon: "◈" },
  { href: "/app/academia",   label: "Academia",     icon: "◉" },
];

const adminNav: NavItem[] = [
  { href: "/admin/cadastros",  label: "Cadastros",  icon: "◎" },
  { href: "/admin/projetos",   label: "Projetos",   icon: "◫" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "◈" },
  { href: "/admin/academia",   label: "Academia",   icon: "◉" },
];

interface SidebarProps {
  variant: "parceiro" | "admin";
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ variant, userName = "Parceiro", userEmail = "parceiro@email.com" }: SidebarProps) {
  const pathname = usePathname();
  const nav = variant === "admin" ? adminNav : parceiroNav;
  const title = variant === "admin" ? "Painel Admin" : "Área do Parceiro";

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        background: "#0E1320",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "16px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src="/logo.jpg"
          alt="Vine Grupo"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            mixBlendMode: "screen",
            filter: "brightness(1.4) contrast(1.2)",
          }}
        />
        <div style={{ fontSize: 10, color: "#7A839A", marginTop: 6 }}>{title}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", minHeight: 0 }}>
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                color: active ? "#FFB800" : "#7A839A",
                background: active ? "rgba(255,184,0,0.10)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 10px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        {variant === "parceiro" && (
          <div style={{
            background: "#131A2B",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#EAEEF7", marginBottom: 2 }}>{userName}</div>
            <div style={{ fontSize: 10, color: "#7A839A" }}>{userEmail}</div>
          </div>
        )}
        <form action="/logout" method="post">
          <button
            type="submit"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 10, border: "none",
              background: "transparent", width: "100%",
              fontSize: 13, fontWeight: 500, color: "#FF5C7A",
              cursor: "pointer",
            }}
          >
            <span>⬡</span>
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
