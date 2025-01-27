#!/usr/bin/env bash
set -eu

URL=${URL:-http://localhost:1234}

curl -v  --data-binary "@${1}" "${URL}"
