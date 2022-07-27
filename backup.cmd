if not exist "dist\client\data" mkdir dist\client\data
if not exist "dist\client\reports" mkdir dist\client\reports
if not exist ".data" mkdir .data
attrib +h .data
dist\bin\node.exe dist\scripts\backup.js
copy .data\*.json dist\client\data
copy .data\*.csv dist\client\reports
