#!/bin/bash
mkdir -p reports
cd bcp
node js/backup.js
cp data/*.json root/data
cp data/*.csv ../reports
cd ..
