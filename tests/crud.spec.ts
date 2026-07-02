import { test, expect } from "@playwright/test";
import { login, criarProjeto, ADMIN, PARTNER_A } from "./helpers/auth";

test.describe("CRUD — fluxos principais", () => {
  test("parceiro cria projeto e ele aparece no kanban", async ({ page }) => {
    const creds = PARTNER_A();
    test.skip(!creds, "Defina PARTNER_A_*");
    await login(page, creds!);

    const nome = `CRUD-${Date.now()}`;
    await criarProjeto(page, nome);
    await expect(page.getByText(nome)).toBeVisible();
  });

  test("admin cria conteúdo na Academia", async ({ page }) => {
    const creds = ADMIN();
    test.skip(!creds, "Defina ADMIN_*");
    await login(page, creds!);

    await page.goto("/admin/academia");
    await page.getByRole("button", { name: /novo conteúdo/i }).click();

    const titulo = `Treino ${Date.now()}`;
    await page.fill('input[name="title"]', titulo);
    await page.selectOption('select[name="category"]', "tecnicas_venda");
    await page.selectOption('select[name="type"]', "video");
    await page.fill('input[name="url"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.getByRole("button", { name: /salvar conteúdo/i }).click();

    await expect(page.getByText(titulo)).toBeVisible({ timeout: 15_000 });
  });

  test("admin marca uma comissão como paga (se houver pendente)", async ({ page }) => {
    const creds = ADMIN();
    test.skip(!creds, "Defina ADMIN_*");
    await login(page, creds!);

    await page.goto("/admin/financeiro");
    const botaoPagar = page.getByRole("button", { name: /marcar pago/i }).first();

    const temPendente = await botaoPagar.isVisible().catch(() => false);
    test.skip(!temPendente, "Sem comissões pendentes para testar pagamento");

    await botaoPagar.click();
    await expect(page.getByText(/^Pago$/).first()).toBeVisible({ timeout: 15_000 });
  });
});
