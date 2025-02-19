#!/usr/bin/env bash
set -eu

URL=${URL:-http://localhost:1234/upload}

curl -v  -F xxx=yyy -F "file=@${1}" "${URL}"
