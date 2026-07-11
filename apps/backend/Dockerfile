FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
RUN pnpm --filter @yoga-app/shared build
RUN pnpm --filter @yoga-app/backend build

FROM node:20-alpine
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/backend/dist ./apps/backend/dist

EXPOSE 8080
CMD ["node", "apps/backend/dist/index.js"]
