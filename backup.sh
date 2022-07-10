#!/bin/bash
cd bcp
node js/backup.js
cp data/*.json root/data
cd ..
