#!/bin/bash

echo "- Update git"
git pull
git submodule update
echo "- Update dist"
cp -ru ref-cdnjs/ajax/libs/* dist/
cp -ru libs/* dist/
echo "- Build packages.json"
node build/build.js ./dist
if [ ! -z $1 ]; then
    echo "- Copy packages.json to $1"
    cp packages.json $1
fi
echo "- Update ok!"