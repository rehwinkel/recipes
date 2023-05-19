#!/bin/sh
CONTAINER=$(docker build -q .)
docker run -it -p 48080:80 --add-host host.docker.internal:host-gateway -v $PWD/../backend/images:/images $CONTAINER