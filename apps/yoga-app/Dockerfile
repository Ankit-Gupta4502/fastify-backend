FROM node:20-alpine AS build
WORKDIR /app

ENV CI=true
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json tsconfig.base.json ./
COPY apps/yoga-app/package.json ./apps/yoga-app/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/yoga-app ./apps/yoga-app
COPY packages/shared ./packages/shared

RUN pnpm --filter @yoga-app/web build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/yoga-app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
