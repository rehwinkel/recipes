#!/bin/sh
cd frontend
yarn build
cd ..

docker build .