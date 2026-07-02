# Deploy — Área do Parceiro

Checklist completo de produção. Execute nesta ordem.

---

## 1. SMTP — Reset de senha por e-mail

Sem SMTP o link de "recuperar senha" não é enviado. Use o **Resend** (plano gratuito cobre o volume inicial).

1. Crie conta em [resend.com](https://resend.com) e adicione seu domínio (ou use o sandbox do Resend)
2. Crie uma API Key
3. No Supabase → **Auth → SMTP Settings** → ative SMTP customizado e preencha:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: _(sua API Key do Resend)_
   - Sender email: `noreply@seudominio.com.br`
   - Sender name: `Power Mais Energia Solar`

> Alternativa: SendGrid, Brevo, ou qualquer provedor SMTP.

---

## 2. Deploy na Vercel

### 2a. Instalar CLI e fazer login
```bash
npm i -g vercel
vercel login
```

### 2b. Deploy (execute dentro de `area-parceiro/`)
```bash
vercel
```
Responda as perguntas:
- Set up and deploy? → **Y**
- Which scope? → sua conta/organização
- Link to existing project? → **N** (primeira vez)
- Project name? → `area-parceiro` (ou outro)
- Directory? → `.` (atual)

O Vercel detecta Next.js automaticamente. Sem `vercel.json` necessário.

### 2c. Configurar variáveis de ambiente no Vercel

Acesse **vercel.com → seu projeto → Settings → Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-DOMINIO.vercel.app` (ou domínio próprio) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kdzmragoatnwqzyttyia.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _(a chave anon do .env.local)_ |

> Marque todas como **Production**, **Preview**, e **Development** se quiser.

### 2d. Redeploy com as variáveis
```bash
vercel --prod
```
Ou pelo dashboard: **Deployments → Redeploy**.

---

## 3. Supabase — Configurações de produção

### 3a. Redirect URLs (obrigatório para reset de senha)

**Auth → URL Configuration → Redirect URLs** → adicione:
```
http://localhost:3000/auth/callback
https://SEU-DOMINIO.vercel.app/auth/callback
```

### 3b. Site URL

**Auth → URL Configuration → Site URL** → preencha com a URL de produção:
```
https://SEU-DOMINIO.vercel.app
```

### 3c. Desligar confirmação de e-mail (se ainda não fez)

**Auth → Providers → Email** → desative **"Confirm email"**

> Com isso, cadastros novos caem direto em `/cadastro-em-analise` e o admin aprova manualmente. Sem necessidade de e-mail de confirmação.

---

## 4. Bootstrap do primeiro admin

Execute no **Supabase → SQL Editor** (substitua pelo e-mail da sua conta):

```sql
-- Promover conta para admin
update public.profiles
   set role = 'admin'
 where email = 'seu@email.com.br';
```

Após isso, faça login → será redirecionado para `/admin/cadastros` automaticamente.

---

## 5. Domínio próprio (opcional)

Em **Vercel → Settings → Domains** adicione seu domínio (ex: `parceiros.solarpowermais.com.br`).

Lembre de atualizar:
- `NEXT_PUBLIC_SITE_URL` no Vercel → novo domínio
- Redirect URLs no Supabase → novo domínio
- Site URL no Supabase → novo domínio

---

## 6. Verificação final pós-deploy

- [ ] `/login` abre sem erro
- [ ] Cadastro novo cai em `/cadastro-em-analise`
- [ ] Admin consegue logar em `/admin/cadastros`
- [ ] Aprovar um parceiro → ele consegue acessar `/app/dashboard`
- [ ] "Recuperar senha" envia e-mail real (requer SMTP configurado)
- [ ] Link do e-mail abre `/atualizar-senha` corretamente

---

## Variáveis de ambiente — referência

| Variável | Local | Produção |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://seu-dominio.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | mesma | mesma |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | mesma | mesma |
