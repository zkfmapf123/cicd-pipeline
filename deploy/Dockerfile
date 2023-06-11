################################## Normal Dockerfile (256MB) ##################################

## Build Stage
FROM node:16-alpine as builder

WORKDIR /usr/src/app

COPY ../server .

RUN npm run build

## Execute Stage
FROM node:16-buster-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/__test__ ./__test__
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/*.json ./

ENV PORT 3000
EXPOSE 3000

CMD ["npm","start"]
