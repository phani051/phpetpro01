#!/bin/bash

if [[ -f "$1" ]]; then
    # Read from file if first argument is a file
    while IFS= read -r name; do
        echo "Hello, $name!"
    done < "$1"
elif [[ ! -z "$1" ]]; then
    # If argument is given as a direct input
    echo "Hello, $1!"
else
    echo "Usage: $0 <name or filename>"
fi
