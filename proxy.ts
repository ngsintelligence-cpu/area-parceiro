import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresha a sessão (obrigatório para Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rotas de auth — se já logado, redireciona para a área correta
  const authRoutes = ["/login", "/cadastro", "/recuperar-senha"];
  if (authRoutes.some((r) => path === r || path.startsWith(r + "/"))) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/cadastros", request.url));
      }
      if (profile?.status === "aprovado") {
        return NextResponse.redirect(new URL("/app/dashboard", request.url));
      }
      // pendente ou rejeitado → deixa ver /cadastro-em-analise
      return NextResponse.redirect(
        new URL("/cadastro-em-analise", request.url)
      );
    }
    return supabaseResponse;
  }

  // /cadastro-em-analise — acessível sem login (logo após signup)
  if (path === "/cadastro-em-analise") {
    return supabaseResponse;
  }

  // Rotas protegidas — exige autenticação
  if (path.startsWith("/app") || path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    // Rotas admin
    if (path.startsWith("/admin")) {
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return supabaseResponse;
    }

    // Rotas parceiro
    if (path.startsWith("/app")) {
      if (profile?.status !== "aprovado") {
        return NextResponse.redirect(
          new URL("/cadastro-em-analise", request.url)
        );
      }
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/cadastro-em-analise",
    "/app/:path*",
    "/admin/:path*",
  ],
};
