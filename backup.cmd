if not exist "reports" mkdir reports
cd bcp
node\node.exe js/backup.js
copy data\*.json root\data
copy data\*.csv ..\reports
cd ..
