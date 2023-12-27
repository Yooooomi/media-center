FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

COPY packages/server/package.json packages/server/
COPY packages/domain-driven/package.json packages/domain-driven/
COPY packages/algorithm/package.json packages/algorithm/
COPY packages/dev/package.json packages/dev/

RUN yarn --frozen-lockfile

COPY packages/server packages/server
COPY packages/domain-driven packages/domain-driven
COPY packages/algorithm packages/algorithm
COPY packages/dev packages/dev

RUN yarn workspace @media-center/server build:production

RUN find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

RUN yarn --frozen-lockfile --production

CMD [ "yarn", "workspace",  "@media-center/server", "start" ]

FROM node:20-alpine

WORKDIR /app

COPY --from=BUILDER /app/packages/server/lib/index.js .

CMD [ "node", "index.js" ]
