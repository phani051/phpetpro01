#!/bin/bash
echo "List of system users:"
cut -d: -f1 /etc/passwd
