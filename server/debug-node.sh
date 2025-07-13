#!/bin/bash
set -e

echo "🔍 Debugging Node.js Working Directory Issue"
echo "=============================================="

echo "Current directory:"
pwd

echo -e "\nListing server directory:"
ls -la /Users/vinayakpandey/Desktop/bodPlatform/server/

echo -e "\nTesting Node.js execution:"
cd /Users/vinayakpandey/Desktop/bodPlatform/server
pwd
echo "About to run: node index.js"
exec node index.js
