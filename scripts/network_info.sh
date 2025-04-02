#!/bin/bash
echo "Network Interfaces:"
ip addr show
echo "Active Connections:"
netstat -tulnp | head -n 10
