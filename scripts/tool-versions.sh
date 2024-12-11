#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <key>"
  exit 1
fi

KEY=$1
FILE=".tool-versions"

if [ ! -f "$FILE" ]; then
  echo "Error: $FILE not found."
  exit 1
fi

cat "$FILE" | jq -R -s -c "
  split(\"\n\") |
  map(select(length > 0) | split(\" \") | { (.[0]): .[1] }) |
  add | .${KEY}" -r
