FROM rust:1-slim-bullseye as buildbackend

COPY backend /build
WORKDIR /build

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y libsqlite3-dev
RUN CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse cargo build --release

FROM nginx:stable-bullseye

EXPOSE 80

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

COPY frontend/dist /dist
COPY --from=buildbackend /build/target/release/backend /bin/
COPY container/serve.sh /bin/
COPY container/nginx.conf /etc/nginx/nginx.conf

WORKDIR /data

CMD ["bash", "/bin/serve.sh"]