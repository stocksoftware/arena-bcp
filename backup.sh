#!/bin/bash
mkdir -p reports
node dist/scripts/backup.js
cp data/*.csv reports
