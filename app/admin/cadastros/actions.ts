"use server";

import { createClient } from "@/lib/supabase/server";
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
