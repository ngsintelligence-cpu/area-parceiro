import { createClient } from "@/lib/supabase/server";
import AdminFinanceiroClient from "./AdminFinanceiroClient";

export default async function AdminFinanceiroPage() {
  const supabase = await createClient();

  const [{ data: rawComm }, { data: rawProj }] = await Promise.all([
    supabase
      .from("commissions")
      .select(`
        id, amount, status, paid_at,
        project:projects!project_id(id, client_name, city, state),
        partner:profiles!partner_id(full_name, email)
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("projects")
      .select(`id, client_name, partner:profiles!partner_id(full_name)`)
      .order("client_name"),
  ]);

  const commissions = (rawComm ?? []).map((c) => ({
    ...c,
    amount: Number(c.amount),
    project: Array.isArray(c.project) ? (c.project[0] ?? null) : c.project,
    partner: Array.isArray(c.partner) ? (c.partner[0] ?? null) : c.partner,
  }));

  const projects = (rawProj ?? []).map((p) => ({
    ...p,
    partner: Array.isArray(p.partner) ? (p.partner[0] ?? null) : p.partner,
  }));

  const totalPagar = commissions.filter((c) => c.status === "pendente").reduce((s, c) => s + c.amount, 0);
  const totalPago  = commissions.filter((c) => c.status === "pago").reduce((s, c) => s + c.amount, 0);
  const parceirosAtivos = new Set(commissions.map((c) => c.partner?.email).filter(Boolean)).size;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <AdminFinanceiroClient
      commissions={commissions as any}
      projects={projects as any}
      totalPagar={totalPagar}
      totalPago={totalPago}
      parceirosAtivos={parceirosAtivos}
    />
  );
}
