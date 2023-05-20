#!/bin/sh
cd frontend
yarn
yarn build
cd ..

docker build .