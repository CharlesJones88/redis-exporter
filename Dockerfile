FROM oven/bun:latest AS base

WORKDIR /app

FROM base AS install

RUN mkdir -p /tmp/app
COPY package.json bun.lock /tmp/app/

RUN cd /tmp/app && bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /tmp/app/node_modules node_modules
COPY src src

LABEL loki_exclude="true"
RUN groupadd -g 3000 docker && usermod -aG docker bun && newgrp docker
USER bun
EXPOSE 9121/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]