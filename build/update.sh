#!/bin/bash

if [ "$1" == "" ]
then
    echo "[Usage] ./build/update.sh <dir>"
    exit
fi

echo "- Update git"
git pull
git submodule update --force
echo "- Improve path"
rm -rf cdnjs
cp -rf ref-cdnjs/ajax/libs cdnjs
echo "- Build packages.json"
node build/build.js
echo "- Copy packages.json to $1"
cp packages.json $1


