"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarProjetoAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const pwrRaw = formData.get("power_kwp") as string;
  const valRaw = formData.get("value") as string;

  const { error } = await supabase.from("projects").insert({
    partner_id: user.id,
    client_name: formData.get("client_name") as string,
    city: (formData.get("city") as string) || null,
    state: (formData.get("state") as string) || null,
    power_kwp: pwrRaw ? Number(pwrRaw.replace(",", ".")) : null,
    value: valRaw ? Number(valRaw.replace(/\D/g, "")) : null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: "Erro ao criar projeto. Tente novamente." };

  revalidatePath("/app/projetos");
  return { success: true };
}
