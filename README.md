# FastRelax Web

Painel web (Next.js) da FastRelax: RH/admin gerencia empresas, colaboradores, cadeiras e configurações; colaboradores agendam e conduzem suas sessões de massagem pelo portal. Fala com o [fastrelax-api](../fastrelax-api) via Server Actions/Server Components — o token de acesso fica em cookie httpOnly e nunca chega ao bundle do cliente. Empacotado também como app Android (Capacitor).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Capacitor (Android)
- pnpm

## Configuração

```bash
cp .env.example .env
```

Preencha `.env` com:
- `FASTRELAX_API_URL` — endereço do fastrelax-api alcançável a partir do *servidor* Next (não do navegador do usuário), incluindo `/api/v1`
- `SESSION_COOKIE_SECURE` — `true` só quando servido por HTTPS; em rede interna por IP, deixe `false`
- `CAPACITOR_SERVER_URL` — URL que o WebView do app Android abre

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Sobe em `http://localhost:80` (porta fixa em `package.json`, ajuste se precisar rodar sem privilégio de porta baixa).

## Build

```bash
pnpm build
pnpm start
```

## App Android (Capacitor)

```bash
pnpm build
npx cap sync android
npx cap open android
```

`capacitor.config.ts` usa `CAPACITOR_SERVER_URL` como servidor remoto do WebView — o app não empacota os assets, ele aponta para o Next rodando em produção.

## Estrutura

```
src/
├── app/           # rotas (App Router): (auth), colaborador, painel, api
└── features/      # um pacote por domínio: authentication, chairs, collaborator-portal,
                   # collaborators, companies, dashboard, departments, evaluations,
                   # firmwares, locations, lookup, notifications, sessions, settings, users
```

Cada feature segue o padrão actions (Server Actions) → service (client HTTP para a API) → components, com schemas/types espelhando os DTOs do fastrelax-api.

## Login de colaborador

Fluxo separado do login de RH/admin: slug da empresa + CPF + senha (o CNPJ não entra — só RH/SYSADMIN veem/editam o slug). Primeiro acesso é por convite (e-mail com link); senha temporária é só fallback quando o e-mail está desligado no backend.
