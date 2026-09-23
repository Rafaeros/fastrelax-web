# syntax=docker/dockerfile:1

# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variáveis lidas em src/lib/env.ts são resolvidas em runtime (process.env),
# não em build — não precisam existir aqui.
RUN pnpm build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

# Porta interna do server standalone; o mapeamento externo (ex.: 80) fica no
# docker-compose ou no proxy reverso — não use a porta 80 embutida no `pnpm
# dev`/`pnpm start`, que quebraria rodando como usuário não-root.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
