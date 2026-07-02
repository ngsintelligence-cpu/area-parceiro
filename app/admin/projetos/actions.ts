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
