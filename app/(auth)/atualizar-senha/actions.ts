"use server";

import { createClient } from "@/lib/supabase/server";

export async function atualizarSenhaAction(_: unknown, formData: FormData) {
  const senha = formData.get("senha") as string;
  const confirmar = formData.get("confirmar") as string;

  if (senha !== confirmar) {
    return { error: "As senhas não coincidem." };
  }
  if (senha.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();

  // Exige sessão de recuperação (criada pelo /auth/callback)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Link expirado ou inválido. Solicite a redefinição novamente." };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
  }

  // Encerra a sessão de recuperação para forçar login com a nova senha
  await supabase.auth.signOut();
  return { sucesso: true };
}
