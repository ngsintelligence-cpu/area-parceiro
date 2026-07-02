import { test, expect } from "@playwright/test";
import { login, logout, ADMIN, PARTNER_A } from "./helpers/auth";

test.describe("Auth — login por papel", () => {
  test("admin entra e cai em /admin", async ({ page }) => {
    const creds = ADMIN();
    test.skip(!creds, "Defina ADMIN_EMAIL / ADMIN_PASSWORD em .env.test.local");
    await login(page, creds!);
    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.getByText(/painel admin/i)).toBeVisible();
  });

  test("parceiro aprovado entra e cai em /app/dashboard", async ({ page }) => {
    const creds = PARTNER_A();
    test.skip(!creds, "Defina PARTNER_A_EMAIL / PARTNER_A_PASSWORD em .env.test.local");
    await login(page, creds!);
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByRole("heading", { name: /olá,/i })).toBeVisible();
  });

  test("parceiro consegue sair (logout)", async ({ page }) => {
    const creds = PARTNER_A();
    test.skip(!creds, "Defina PARTNER_A_*");
    await login(page, creds!);
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
