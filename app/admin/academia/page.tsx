import { createClient } from "@/lib/supabase/server";
import AdminAcademiaClient from "./AdminAcademiaClient";

export default async function AdminAcademiaPage() {
  const supabase = await createClient();

  const { data: conteudos } = await supabase
    .from("academy_content")
    .select("id, title, category, type, status, url, created_at")
    .order("created_at", { ascending: false });

  return <AdminAcademiaClient conteudos={conteudos ?? []} />;
}
