FROM node:20.12.0-alpine3.18 
#as builder

#WORKDIR /usr/src/app
WORKDIR /app

RUN apk add --no-cache -t build-dependencies git make gcc g++ python3 \
    libtool autoconf pkgconfig automake librdkafka-dev bash # wget tar xz

# RUN cd $(npm root -g)/npm
# RUN npm install -g node-gyp

COPY packages/config-svc-be/package*.json ./
RUN ls -la

RUN npm install
RUN ls -la

#COPY . /usr/src/app

# Note on BUILD_LIBRDKAFKA:
#   Use BUILD_LIBRDKAFKA=0 only if we have installed librdkafka-dev in
#   the builder image and librdkafka in the final image

########################################
# Copy code and build

# root tsconfig.json
#COPY tsconfig*.json ./
COPY packages/config-svc-be/tsconfig*.json ./

RUN ls -la

# copy service code
COPY packages/config-svc-be ./packages/config-svc-be/  
COPY packages/config-svc-be/.env.sample ./.env 

RUN ls -la

# build
RUN npm run build

# ########################################
# FROM node:20.10.0-alpine3.18
# WORKDIR /app
# RUN mkdir /app/data

# #RUN apk add librdkafka

# EXPOSE 3600
# COPY --from=builder /app .

CMD [ "npm", "run", "start:dev" ]
#CMD [ "/bin/sh" ]