#!/bin/bash
mkdir -p reports
cd bcp
node js/backup.js
cp data/*.json web/public
cp data/*.csv ../reports
cd ..
