#!/bin/bash
mkdir -p dist/client/data
mkdir -p dist/client/reports
mkdir -p .data
node dist/scripts/backup.js
cp .data/*.json dist/client/data
cp .data/*.csv dist/client/reports
mkdir -p bcp/public/data
mkdir -p bcp/public/reports
cp .data/*.json bcp/public/data
cp .data/*.csv bcp/public/reports

