#!/bin/bash

echo "- Update git"
git pull
git submodule update --force
echo "- Create dist"
rm -rf dist
mkdir -p dist
cp -rf ref-cdnjs/ajax/libs/* dist/
cp -rf libs/* dist/
echo "- Build packages.json"
node build/build.js ./dist
if [ ! -z $1 ]; then
    echo "- Copy packages.json to $1"
    cp packages.json $1
fi
echo "- Update ok!"