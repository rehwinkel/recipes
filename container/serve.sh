#!/bin/sh
/bin/backend --host 127.0.0.1 --port 8080 --db-file /data/recipes.sqlite --images-dir /data/images/ &
nginx -g "daemon off;"