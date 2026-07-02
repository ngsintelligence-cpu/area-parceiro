import { test, expect } from "@playwright/test";
import { login, ADMIN, PARTNER_A } from "./helpers/auth";

test.describe("Proteção de rotas (proxy.ts)", () => {
  test("parceiro NÃO acessa área admin", async ({ page }) => {
    const creds = PARTNER_A();
    test.skip(!creds, "Defina PARTNER_A_*");
    await login(page, creds!);

    await page.goto("/admin/cadastros");
    // proxy redireciona parceiro para fora de /admin
    await expect(page).not.toHaveURL(/\/admin\//);
  });

  test("admin acessa área admin normalmente", async ({ page }) => {
    const creds = ADMIN();
    test.skip(!creds, "Defina ADMIN_*");
    await login(page, creds!);

    await page.goto("/admin/projetos");
    await expect(page).toHaveURL(/\/admin\/projetos/);
  });

  test("parceiro logado é redirecionado ao tentar /login", async ({ page }) => {
    const creds = PARTNER_A();
    test.skip(!creds, "Defina PARTNER_A_*");
    await login(page, creds!);

    await page.goto("/login");
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
