# Deploy — Hostinger

Guia completo para colocar a plataforma no ar em um domínio Hostinger já ativo.

Dois cenários cobertos — escolha o que corresponde ao seu plano:
- **Opção A — VPS** (planos KVM/VPS): mais robusto, controle total
- **Opção B — hPanel Node.js** (planos Business/Cloud Hosting): mais simples, sem SSH

---

## 0. Pré-requisito (já feito)

`next.config.ts` já tem `output: "standalone"` configurado. Isso gera `.next/standalone/` durante o build — um bundle mínimo com apenas os arquivos necessários, sem precisar de `npm install` no servidor.

---

## 1. Build de produção (local, antes de fazer upload)

As variáveis `NEXT_PUBLIC_*` são **embutidas no JavaScript durante o build**, não em runtime. Por isso o build precisa ser feito com os valores de produção.

### 1a. Criar `.env.production.local`

Crie este arquivo na pasta `area-parceiro/` (já está no `.gitignore`):

```bash
# .env.production.local — valores de PRODUÇÃO (nunca sobe pro git)
NEXT_PUBLIC_SITE_URL=https://parceiros.seudominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://kdzmragoatnwqzyttyia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkem1yYWdvYXRud3F6eXR0eWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTE4NDksImV4cCI6MjA5ODI2Nzg0OX0.ZnKRL92qstmAa2Gr6gDtm4XAknfOEM-k5hiiEj9CNVA
```

> Substitua `parceiros.seudominio.com.br` pelo subdomínio/domínio real. O `.env.local` de desenvolvimento fica intacto.

### 1b. Build

```bash
npm run build
```

O Next.js lê o `.env.production.local` automaticamente porque o build roda com `NODE_ENV=production`.

### 1c. Montar o pacote standalone

Após o build, os assets estáticos precisam ser copiados para dentro do standalone:

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse -Force "public" ".next\standalone\public"
Copy-Item -Recurse -Force ".next\static" ".next\standalone\.next\static"
```

**Linux/Mac:**
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### 1d. Compactar para upload

```powershell
Compress-Archive -Path ".next\standalone\*" -DestinationPath "area-parceiro-deploy.zip"
```

---

## Opção A — VPS com SSH

### A1. Preparar o VPS (uma vez)

Acesse via SSH (`ssh root@IP-DO-VPS`) e instale as dependências:

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2 (gerenciador de processo — mantém o app no ar)
npm install -g pm2

# Nginx (reverse proxy)
apt-get install -y nginx

# Certbot (SSL gratuito)
apt-get install -y certbot python3-certbot-nginx
```

### A2. Criar a pasta do app

```bash
mkdir -p /var/www/area-parceiro
```

### A3. Upload do pacote

Do seu computador local (PowerShell ou terminal):

```bash
scp area-parceiro-deploy.zip root@IP-DO-VPS:/var/www/area-parceiro/
```

No VPS, extrair:

```bash
cd /var/www/area-parceiro
unzip area-parceiro-deploy.zip
rm area-parceiro-deploy.zip
```

A estrutura final deve ser:
```
/var/www/area-parceiro/
├── server.js
├── package.json
├── node_modules/
├── public/
└── .next/
    ├── standalone/   ← não necessário após copiar
    └── static/
```

### A4. Iniciar com PM2

```bash
cd /var/www/area-parceiro
PORT=3000 pm2 start server.js --name area-parceiro
pm2 save
pm2 startup   # copie e execute o comando que ele sugerir
```

Verificar se está rodando:
```bash
pm2 status
curl http://localhost:3000
```

### A5. Configurar Nginx

Crie o arquivo de configuração (substitua o domínio):

```bash
nano /etc/nginx/sites-available/area-parceiro
```

Cole o conteúdo abaixo:

```nginx
server {
    listen 80;
    server_name parceiros.seudominio.com.br;

    # Desliga o buffer para suportar streaming do Next.js
    proxy_buffering off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar e testar:

```bash
ln -s /etc/nginx/sites-available/area-parceiro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### A6. SSL (HTTPS gratuito)

```bash
certbot --nginx -d parceiros.seudominio.com.br
```

O Certbot atualiza o Nginx automaticamente para HTTPS e agenda a renovação.

### A7. Apontar o domínio

No painel do Hostinger → **Domínios → DNS** → adicione (ou edite) um registro A:

| Tipo | Host | Valor |
|---|---|---|
| A | `parceiros` | IP do seu VPS |

> Se o domínio raiz (`@`), use o IP diretamente. Propagação leva até 24h.

---

## Opção B — hPanel Node.js

> Requer plano **Business Web Hosting** ou **Cloud Hosting**. Não funciona em planos Starter.

### B1. Upload via Gerenciador de Arquivos

1. No hPanel → **Arquivos → Gerenciador de Arquivos**
2. Navegue para a pasta do domínio (normalmente `public_html/`)
3. Crie uma subpasta (ex: `area-parceiro`)
4. Faça upload do `area-parceiro-deploy.zip` e extraia ali

Estrutura após extração:
```
public_html/area-parceiro/
├── server.js
├── package.json
├── node_modules/
├── public/
└── .next/static/
```

### B2. Configurar Node.js no hPanel

1. hPanel → **Sites → Node.js**
2. Clique em **Create Application** (ou editar se já existir)
3. Preencha:
   - **Node.js version:** `20.x`
   - **Application root:** `area-parceiro` (relativo ao `public_html/`)
   - **Application URL:** seu domínio ou subdomínio
   - **Application startup file:** `server.js`
4. Em **Environment variables**, adicione:

   | Variável | Valor |
   |---|---|
   | `PORT` | `3000` (ou a porta que o hPanel indicar) |

   > As `NEXT_PUBLIC_*` já estão embutidas no bundle — não precisa adicioná-las aqui.

5. Clique em **Create** / **Save** e depois **Restart**

### B3. Verificar

Acesse o domínio no navegador. Se aparecer erro 502, aguarde 1–2 min para o app iniciar ou verifique os logs no hPanel → Node.js → **Log**.

---

## Supabase — ajustes para produção

Independente da opção escolhida, faça isso no painel do Supabase:

**Auth → URL Configuration → Redirect URLs** — adicione:
```
https://parceiros.seudominio.com.br/auth/callback
```

**Auth → URL Configuration → Site URL:**
```
https://parceiros.seudominio.com.br
```

**Auth → Providers → Email** → desligar **"Confirm email"** (se ainda não fez)

---

## Bootstrap do primeiro admin

Execute no **Supabase → SQL Editor**:

```sql
update public.profiles
   set role = 'admin'
 where email = 'seu@email.com.br';
```

---

## SMTP para reset de senha

Sem SMTP o link de "recuperar senha" não chega. Use Resend (gratuito):

1. Crie conta em [resend.com](https://resend.com) → gere uma API Key
2. Supabase → **Auth → SMTP Settings** → ative e preencha:
   - Host: `smtp.resend.com` | Port: `465`
   - User: `resend` | Password: sua API Key
   - Sender: `noreply@seudominio.com.br`

---

## Atualizações futuras

Para publicar uma nova versão:

1. Faça as alterações localmente
2. Repita os passos do **item 1** (build + montar pacote + zipar)
3. **Opção A (VPS):** re-upload + `pm2 restart area-parceiro`
4. **Opção B (hPanel):** re-upload + reiniciar no painel Node.js

---

## Verificação final

- [ ] Domínio abre a tela de login
- [ ] Cadastro novo cai em `/cadastro-em-analise`
- [ ] Admin consegue logar em `/admin/cadastros`
- [ ] Parceiro aprovado acessa `/app/dashboard`
- [ ] Botão "Sair" visível na sidebar
- [ ] Link de reset de senha chega por e-mail (após SMTP configurado)
