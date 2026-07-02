"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function pagarComissaoAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const commissionId = formData.get("commission_id") as string;

  await supabase
    .from("commissions")
    .update({ status: "pago", paid_at: new Date().toISOString(), paid_by: user?.id })
    .eq("id", commissionId);

  revalidatePath("/admin/financeiro");
}

export async function criarComissaoAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get("project_id") as string;
  const amountRaw = formData.get("amount") as string;

  const { data: project } = await supabase
    .from("projects")
    .select("partner_id")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Projeto não encontrado." };

  const amount = Number(amountRaw.replace(",", "."));
  if (!amount || amount <= 0) return { error: "Valor inválido." };

  const { error } = await supabase.from("commissions").insert({
    project_id: projectId,
    partner_id: project.partner_id,
    amount,
  });

  if (error) return { error: "Erro ao criar comissão. Tente novamente." };

  revalidatePath("/admin/financeiro");
  return { success: true };
}
