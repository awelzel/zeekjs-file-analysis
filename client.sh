#!/usr/bin/env bash
set -eux

URL=${URL:-http://localhost:1234/upload}

curl -v  -F "file=@${1}" "${URL}"
