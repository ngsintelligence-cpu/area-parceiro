"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const categorias = ["fundamentos_solar", "tecnicas_venda", "financiamento"];
const tipos = ["video", "pdf"];

export async function criarConteudoAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const type = formData.get("type") as string;
  const url = (formData.get("url") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const durRaw = formData.get("duration_min") as string;

  if (!title) return { error: "Informe o título." };
  if (!categorias.includes(category)) return { error: "Categoria inválida." };
  if (!tipos.includes(type)) return { error: "Tipo inválido." };
  if (!url) return { error: "Informe o link do conteúdo." };

  const { error } = await supabase.from("academy_content").insert({
    title,
    description,
    category,
    type,
    url,
    duration_min: durRaw ? Number(durRaw) : null,
    created_by: user?.id,
  });

  if (error) return { error: "Erro ao criar conteúdo. Tente novamente." };

  revalidatePath("/admin/academia");
  revalidatePath("/app/academia");
  return { success: true };
}

export async function toggleStatusAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const atual = formData.get("status") as string;

  await supabase
    .from("academy_content")
    .update({ status: atual === "ativo" ? "inativo" : "ativo" })
    .eq("id", id);

  revalidatePath("/admin/academia");
  revalidatePath("/app/academia");
}

export async function deletarConteudoAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("academy_content").delete().eq("id", id);

  revalidatePath("/admin/academia");
  revalidatePath("/app/academia");
}
