#!/bin/bash

echo "- Update git"
git submodule update --force
git pull
echo "- Improve path"
rm -rf cdnjs
cp -rf ref-cdnjs/ajax/libs cdnjs
echo "- Build packages.json"
node build/build.js
