"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function cadastroAction(_: unknown, formData: FormData) {
  const senha = formData.get("senha") as string;
  const confirmar = formData.get("confirmar") as string;

  if (senha !== confirmar) {
    return { error: "As senhas não coincidem." };
  }

  if (senha.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: senha,
    options: {
      data: {
        full_name: formData.get("nome") as string,
        phone: formData.get("telefone") as string,
        cpf: formData.get("cpf") as string,
        city: formData.get("cidade") as string,
        state: formData.get("estado") as string,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  redirect("/cadastro-em-analise");
}
