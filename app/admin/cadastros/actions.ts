"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function aprovarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      status: "aprovado",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", formData.get("partnerId") as string);

  revalidatePath("/admin/cadastros");
}

export async function rejeitarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      status: "rejeitado",
      rejected_by: user.id,
      rejected_at: new Date().toISOString(),
      rejection_reason: formData.get("motivo") as string,
    })
    .eq("id", formData.get("partnerId") as string);

  revalidatePath("/admin/cadastros");
}

export async function criarParceiroAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const full_name = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const cpf = (formData.get("cpf") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;

  if (!full_name || !email || !password) return { error: "Nome, e-mail e senha são obrigatórios" };
  if (password.length < 8) return { error: "Senha mínima de 8 caracteres" };

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, cpf, city, state },
  });

  if (authError) return { error: authError.message };

  await admin
    .from("profiles")
    .update({
      status: "aprovado",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", authData.user.id);

  revalidatePath("/admin/cadastros");
  return { success: true };
}
