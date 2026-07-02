"use server";

import { createClient } from "@/lib/supabase/server";

export async function recuperarSenhaAction(_: unknown, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/atualizar-senha`,
    }
  );

  if (error) {
    return { error: "Não foi possível enviar o e-mail. Tente novamente." };
  }

  return { enviado: true };
}
