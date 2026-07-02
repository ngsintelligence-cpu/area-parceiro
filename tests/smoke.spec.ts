import { test, expect } from "@playwright/test";

// Estes testes NÃO precisam de credenciais — validam o esqueleto de auth/rotas.

test.describe("Smoke — sem credenciais", () => {
  test("a tela de login renderiza o formulário", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /entrar na sua conta/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="senha"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("rota /app/dashboard sem login redireciona para /login", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("rota /admin/cadastros sem login redireciona para /login", async ({ page }) => {
    await page.goto("/admin/cadastros");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login com credenciais inválidas mostra erro", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "naoexiste@teste.com");
    await page.fill('input[name="senha"]', "senhaerrada123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(/e-mail ou senha incorretos/i)).toBeVisible({ timeout: 15_000 });
  });

  test("página de cadastro está acessível", async ({ page }) => {
    await page.goto("/cadastro");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});
