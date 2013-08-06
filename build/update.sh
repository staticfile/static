#!/bin/bash

platform=`uname`

echo "- Update git"
git pull
git submodule update

echo "- Update dist"
mkdir -p dist/
if [ "$platform" == "Linux" ];then
    cp -ru ref-cdnjs/ajax/libs/* dist/
    cp -ru libs/* dist/
else
    cp -rn ref-cdnjs/ajax/libs/* dist/
    cp -rn libs/* dist/
fi

echo "- Build packages.json"
node build/build.js ./dist
if [ ! -z $1 ]; then
    echo "- Copy packages.json to $1"
    cp packages.json $1
fi
echo "- Update ok!"