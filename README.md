# Livro Financeiro — Sistema por assinatura

Aplicação completa: cadastro/login (Supabase Auth), lançamentos de entrada e
despesa, dashboards de mês/ano, checkout de assinatura via Mercado Pago e
painel administrativo.

## 1. Configurar as variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` ficam em
  Project Settings → API do seu projeto (o projeto já existe, ref `ucksyspdwbwqsyhafrxo`).
  `SUPABASE_SERVICE_ROLE_KEY` está na mesma página — **trate como senha, nunca exponha no navegador**.
- **Mercado Pago**: crie uma aplicação no [Painel do desenvolvedor](https://www.mercadopago.com.br/developers/panel),
  copie o Access Token (comece com o de TESTE) e configure um Webhook apontando para
  `https://SEU-DOMINIO/api/mercadopago/webhook` — o "Secret" gerado ali vai em `MERCADOPAGO_WEBHOOK_SECRET`.

## 2. Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## 3. Tornar seu usuário administrador

Depois de criar sua própria conta pelo cadastro normal, rode isto uma vez no
SQL Editor do Supabase (trocando o e-mail):

```sql
update public.perfis set is_admin = true
where id = (select id from auth.users where email = 'seu@email.com');
```

Depois disso, `/admin` fica acessível para você.

## 4. Publicar (deploy)

O jeito mais simples é a [Vercel](https://vercel.com):

1. Suba esta pasta para um repositório no GitHub
2. Na Vercel, clique em "Add New Project" e selecione o repositório
3. Cole as mesmas variáveis de ambiente do `.env.local` nas configurações do projeto
4. Depois do primeiro deploy, atualize `NEXT_PUBLIC_SUPABASE_URL`... e principalmente
   `NEXT_PUBLIC_SITE_URL` para a URL real (ex.: `https://seusite.com`) e refaça o deploy
5. Atualize a URL do Webhook no painel do Mercado Pago para a URL real também

## O que ainda vale evoluir

- Trocar as credenciais de teste do Mercado Pago pelas de produção só depois de
  testar o fluxo inteiro (cadastro → checkout → webhook → assinatura "ativa")
- Gerar os tipos TypeScript do banco (`supabase gen types typescript`) para
  substituir os tipos manuais em `app/admin/page.tsx`
- O bot de WhatsApp (lançamento por mensagem/áudio) e a integração bancária do
  plano Ouro (via Pluggy) ainda não estão neste pacote — ficaram para depois,
  por decisão já combinada

## Estrutura

```
app/
  page.tsx                 → landing + planos
  cadastro/, login/         → autenticação
  auth/confirm/             → confirmação de e-mail
  painel/                   → área logada (lançamentos, dashboard, assinatura)
  admin/                    → painel administrativo
  api/checkout/             → cria a assinatura no Mercado Pago
  api/mercadopago/webhook/  → recebe as notificações de pagamento
lib/
  supabase/                 → clientes Supabase (browser, servidor, serviço)
  mercadopago.ts            → integração com o Mercado Pago
components/
  GraficoRosca.tsx           → gráfico de rosca com legenda e hover
  SeletorPeriodo.tsx         → seletor de mês/ano
```
