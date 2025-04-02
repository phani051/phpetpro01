#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <greeting> [file]"
    exit 1
fi

GREETING="$1"
FILE="$2"

if [ -z "$FILE" ]; then
    echo "$GREETING, User!"
else
    while IFS= read -r name; do
        echo "$GREETING, $name!"
    done < "$FILE"
fi
