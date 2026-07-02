import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar variant="admin" />
      <main style={{
        marginLeft: 240,
        flex: 1,
        minHeight: "100vh",
        background: "#06080F",
        padding: "32px 36px",
        position: "relative",
      }}>
        <div style={{
          position: "fixed", top: 0, right: 0, width: 500, height: 300,
          background: "radial-gradient(ellipse at top right, rgba(46,155,255,.05), transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100 }}>
          {/* Admin badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(46,155,255,0.10)", border: "1px solid rgba(46,155,255,0.2)",
            borderRadius: 8, padding: "4px 10px", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E9BFF", display: "block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2E9BFF", letterSpacing: "0.5px" }}>
              PAINEL ADMIN
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
