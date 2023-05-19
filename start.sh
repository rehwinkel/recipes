#!/bin/sh
# diesel migration run --database-url ../recipes.sqlite
mkdir -p data/images
./build.sh
CONTAINER=$(docker build -q .)
docker run -it -v $PWD/data:/data -p 8080:80 $CONTAINER