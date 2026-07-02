import { createClient } from "@/lib/supabase/server";
import CadastrosClient from "./CadastrosClient";

export default async function CadastrosPage() {
  const supabase = await createClient();

  const { data: cadastros } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, city, state, status, created_at")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  return <CadastrosClient cadastros={cadastros ?? []} />;
}
