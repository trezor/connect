ARG target='build'

FROM node:12 AS base

FROM base AS img-build
ENV SCRIPT='yarn build:connect'

FROM base AS img-npm
ENV SCRIPT='yarn build:npm'

FROM base AS img-npm-extended
ENV SCRIPT='yarn build:npm-extended'

FROM img-${target} AS final
COPY . /trezor-connect
WORKDIR /trezor-connect
RUN yarn
RUN ${SCRIPT}
