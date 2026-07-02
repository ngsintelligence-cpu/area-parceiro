import { type Page, type Browser, expect } from "@playwright/test";

export type Creds = { email: string; password: string };

/** Lê um par de credenciais do ambiente; retorna null se faltar. */
export function getCreds(emailVar: string, passVar: string): Creds | null {
  const email = process.env[emailVar];
  const password = process.env[passVar];
  if (!email || !password) return null;
  return { email, password };
}

export const ADMIN     = () => getCreds("ADMIN_EMAIL", "ADMIN_PASSWORD");
export const PARTNER_A = () => getCreds("PARTNER_A_EMAIL", "PARTNER_A_PASSWORD");
export const PARTNER_B = () => getCreds("PARTNER_B_EMAIL", "PARTNER_B_PASSWORD");

/** Faz login pela tela real e espera sair de /login. */
export async function login(page: Page, creds: Creds) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="senha"]', creds.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

/** Logout pelo botão Sair da sidebar. */
export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL("**/login", { timeout: 15_000 });
}

/** Abre um contexto isolado já logado com as credenciais dadas. */
export async function loggedInPage(browser: Browser, creds: Creds) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, creds);
  return { context, page };
}

/** Cria um projeto pela UI do parceiro e confirma que apareceu. */
export async function criarProjeto(page: Page, clientName: string) {
  await page.goto("/app/projetos");
  await page.getByRole("button", { name: /novo projeto/i }).click();
  await page.fill('input[name="client_name"]', clientName);
  await page.getByRole("button", { name: /criar projeto/i }).click();
  await expect(page.getByText(clientName)).toBeVisible({ timeout: 15_000 });
}
