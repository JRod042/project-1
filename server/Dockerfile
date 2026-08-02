FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src

ENV PORT=8787 \
    WORKSPACE_ROOT=/data/workspace \
    OMNI_SHELL_MODE=strict \
    NODE_ENV=production

RUN mkdir -p /data/workspace \
  && npm install -g tsx@4.20.3

EXPOSE 8787

VOLUME ["/data/workspace"]

CMD ["tsx", "src/index.ts"]
