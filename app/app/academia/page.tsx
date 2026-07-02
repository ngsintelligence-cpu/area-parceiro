import { createClient } from "@/lib/supabase/server";

const categoriaOrdem = ["fundamentos_solar", "tecnicas_venda", "financiamento"] as const;

const categoriaInfo: Record<string, { nome: string; icon: string }> = {
  fundamentos_solar: { nome: "Fundamentos Solar", icon: "☀️" },
  tecnicas_venda:    { nome: "Técnicas de Venda", icon: "◎" },
  financiamento:     { nome: "Financiamento",     icon: "◈" },
};

type Conteudo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  url: string | null;
  duration_min: number | null;
};

export default async function AcademiaPage() {
  const supabase = await createClient();

  const { data: conteudos } = await supabase
    .from("academy_content")
    .select("id, title, description, category, type, url, duration_min")
    .order("created_at", { ascending: false });

  const lista = (conteudos ?? []) as Conteudo[];

  const grupos = categoriaOrdem
    .map((cat) => ({
      cat,
      info: categoriaInfo[cat],
      conteudos: lista.filter((c) => c.category === cat),
    }))
    .filter((g) => g.conteudos.length > 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>Academia de Vendas</h1>
        <p style={{ fontSize: 13, color: "#7A839A", margin: 0 }}>Treinamentos e materiais exclusivos para parceiros</p>
      </div>

      {grupos.length === 0 ? (
        <div style={{
          background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: "48px 22px", textAlign: "center", color: "#7A839A", fontSize: 14,
        }}>
          Nenhum conteúdo disponível no momento. Volte em breve!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {grupos.map((g) => (
            <div key={g.cat}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "#131A2B", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>{g.info.icon}</div>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-0.2px" }}>{g.info.nome}</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {g.conteudos.map((c) => {
                  const isVideo = c.type === "video";
                  const thumb = isVideo ? "#FFB800" : "#2E9BFF";
                  const card = (
                    <div style={{
                      background: "#0E1320", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 14, overflow: "hidden", cursor: c.url ? "pointer" : "default",
                      height: "100%",
                    }}>
                      <div style={{
                        height: 110,
                        background: `linear-gradient(135deg, ${thumb}22, ${thumb}08)`,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                      }}>
                        {isVideo ? (
                          <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: `${thumb}22`, border: `2px solid ${thumb}60`,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                          }}>▶</div>
                        ) : (
                          <div style={{ fontSize: 32, opacity: 0.6 }}>📄</div>
                        )}
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                          background: isVideo ? "rgba(255,184,0,.15)" : "rgba(46,155,255,.15)",
                          color: isVideo ? "#FFB800" : "#2E9BFF", textTransform: "uppercase",
                        }}>
                          {isVideo ? "Vídeo" : "PDF"}
                        </div>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#EAEEF7", marginBottom: 6, lineHeight: 1.3 }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#7A839A" }}>
                          {isVideo
                            ? `⏱ ${c.duration_min ? `${c.duration_min} min` : "Vídeo"}`
                            : "📄 Documento PDF"}
                        </div>
                      </div>
                    </div>
                  );

                  return c.url ? (
                    <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      {card}
                    </a>
                  ) : (
                    <div key={c.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
