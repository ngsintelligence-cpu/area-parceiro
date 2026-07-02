import { test, expect } from "@playwright/test";
import { loggedInPage, criarProjeto, PARTNER_A, PARTNER_B } from "./helpers/auth";

/**
 * TESTE DE SEGURANÇA CRÍTICO
 * Garante que um parceiro NÃO enxerga os dados de outro parceiro.
 * Usa dois contextos isolados (cookies separados) para A e B.
 */
test.describe("Segurança — isolamento RLS entre parceiros", () => {
  test("parceiro B não vê o projeto criado pelo parceiro A", async ({ browser }) => {
    const a = PARTNER_A();
    const b = PARTNER_B();
    test.skip(!a || !b, "Defina PARTNER_A_* e PARTNER_B_* em .env.test.local");

    const marcador = `RLS-A-${Date.now()}`;

    // Parceiro A cria um projeto com nome único
    const sessA = await loggedInPage(browser, a!);
    try {
      await criarProjeto(sessA.page, marcador);
    } finally {
      await sessA.context.close();
    }

    // Parceiro B abre seus projetos — o marcador de A NÃO pode aparecer
    const sessB = await loggedInPage(browser, b!);
    try {
      await sessB.page.goto("/app/projetos");
      await expect(sessB.page.getByText("Meus Projetos")).toBeVisible();
      await expect(sessB.page.getByText(marcador)).toHaveCount(0);
    } finally {
      await sessB.context.close();
    }
  });

  test("parceiro A vê o próprio projeto (controle positivo)", async ({ browser }) => {
    const a = PARTNER_A();
    test.skip(!a, "Defina PARTNER_A_*");

    const marcador = `RLS-OWN-${Date.now()}`;
    const sessA = await loggedInPage(browser, a!);
    try {
      await criarProjeto(sessA.page, marcador);
      await sessA.page.reload();
      await expect(sessA.page.getByText(marcador)).toBeVisible();
    } finally {
      await sessA.context.close();
    }
  });
});
