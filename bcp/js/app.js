const express = require('express');
const app = express();
const port = 3000;

let root_path;
if (process.argv.length > 2) {
  root_path = process.argv[2];
} else {
  console.log('USAGE: node app.js root_path');
  process.exit(-1);
}

app.use(express.static(root_path));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
