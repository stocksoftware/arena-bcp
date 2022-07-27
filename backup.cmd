if not exist "reports" mkdir reports
dist\bin\node.exe dist\scripts\backup.js
copy data\*.csv reports
