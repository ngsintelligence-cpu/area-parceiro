export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#06080F",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
    }}>
      {/* background radial gradients same as simulator */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: `
          radial-gradient(900px 500px at 80% -10%, rgba(255,184,0,.10), transparent 60%),
          radial-gradient(700px 600px at -10% 110%, rgba(46,155,255,.08), transparent 60%)
        `,
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {children}
      </div>
    </div>
  );
}
