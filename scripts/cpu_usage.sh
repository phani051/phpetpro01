#!/bin/bash
echo "CPU Usage:"
top -b -n1 | grep "Cpu(s)"
