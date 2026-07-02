# Testes — Área do Parceiro

Suíte E2E com **Playwright** rodando contra o app real. Foco em **segurança (RLS)**, autenticação, proteção de rotas e CRUD.

## Setup (uma vez)

1. Instalar dependências e o navegador:
   ```bash
   npm install
   npx playwright install chromium
   ```

2. Criar 2 contas de parceiro pela tela `/cadastro`, depois aprová-las.
   Aprovação rápida via SQL no Supabase (substitua os e-mails):
   ```sql
   update public.profiles
      set status = 'aprovado', approved_at = now()
    where lower(email) in (lower('parceiroA@teste.com'), lower('parceiroB@teste.com'));
   ```

3. Copiar o template de credenciais e preencher:
   ```bash
   cp .env.test.local.example .env.test.local
   ```
   > ⚠️ `.env.test.local` é local e **não** vai pro chat nem pro git.

## Rodar

```bash
npm test              # roda toda a suíte (headless)
npm run test:ui       # modo interativo (debug visual)
npm run test:report   # abre o último relatório HTML
```

O dev server é reaproveitado se já estiver rodando; senão o Playwright sobe um.

## O que cada arquivo cobre

| Arquivo | Precisa de credenciais? | Cobre |
|---|---|---|
| `smoke.spec.ts` | ❌ Não | login renderiza, rotas protegidas redirecionam, login inválido dá erro |
| `auth.spec.ts` | ✅ admin + parceiro A | login por papel, logout |
| `route-protection.spec.ts` | ✅ admin + parceiro A | parceiro bloqueado em /admin, redirect de logado em /login |
| `rls-isolation.spec.ts` | ✅ parceiro A + B | **🔒 parceiro B não vê projeto de A** (vazamento de dados) |
| `crud.spec.ts` | ✅ admin + parceiro A | criar projeto, criar conteúdo, marcar comissão paga |

Testes sem credenciais definidas são **pulados** (skip), não falham.

---

## ✅ Checklist de QA manual (antes de entregar ao cliente)

Coisas difíceis de automatizar ou que valem revisão humana:

### Cadastro & aprovação
- [ ] Cadastro novo cai em `/cadastro-em-analise` com status "Pendente"
- [ ] Admin vê o cadastro em `/admin/cadastros` (aba Pendente)
- [ ] Ao **aprovar**, o parceiro consegue logar e acessar `/app`
- [ ] Ao **rejeitar com motivo**, o parceiro vê o motivo em `/cadastro-em-analise`

### Projetos
- [ ] Parceiro cria projeto e ele aparece na coluna "Novo Lead"
- [ ] Admin muda a etapa de um projeto e ela persiste após reload
- [ ] Valores em R$ formatados corretamente (sem centavos quebrados)

### Financeiro
- [ ] Parceiro vê só as **próprias** comissões
- [ ] Admin cria comissão vinculada a um projeto e ela aparece para o parceiro certo
- [ ] "Marcar pago" muda status e grava a data

### Academia
- [ ] Conteúdo "ativo" aparece para o parceiro; "inativo" some
- [ ] Card abre o link (vídeo/PDF) em nova aba
- [ ] Excluir remove o conteúdo das duas telas

### Visual / responsivo
- [ ] Botão "Sair" sempre visível na sidebar
- [ ] Telas funcionam em janela estreita (tablet/mobile)
- [ ] Sem texto cortado, sem acento quebrado

### Reset de senha (após SMTP configurado — Fase 4)
- [ ] E-mail de redefinição chega
- [ ] Link abre `/atualizar-senha`, salva nova senha, e o login antigo deixa de funcionar
