"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function mudarEtapaAction(projectId: string, stage: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("projects")
    .update({ stage })
    .eq("id", projectId);

  revalidatePath("/admin/projetos");
}

export async function criarProjetoAdminAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const partner_id = formData.get("partner_id") as string;
  const client_name = (formData.get("client_name") as string)?.trim();
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const stage = formData.get("stage") as string || "novo_lead";

  if (!partner_id) return { error: "Selecione um parceiro" };
  if (!client_name) return { error: "Nome do cliente é obrigatório" };

  const { error } = await supabase
    .from("projects")
    .insert({ partner_id, client_name, city, state, stage });

  if (error) return { error: error.message };

  revalidatePath("/admin/projetos");
  return { success: true };
}
