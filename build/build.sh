#!/bin/bash

echo "- Update dist"
mkdir -p dist/
cp -ru ref-cdnjs/ajax/libs/* dist/
cp -ru libs/* dist/

echo "- Build packages.json"
node build/build.js ./dist ./dist
if [ ! -z $1 ]; then
    echo "- Copy packages.json to $1"
    cp ./dist/packages.json $1
fi
echo "- Build ok!"