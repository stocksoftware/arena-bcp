const CONSOLE = require('./lib/console');
const fs = require('fs');
const mergeYaml = require('merge-yaml');
const gitRevision = require('git-revision');
const request = require('request');
const csvjson = require('csvjson');

// Default locations for config files
let commonConfigFile = 'config/common.yml';
let localConfigFile = '../config/local.yml';

console.log('======= STARTING ======');

if (process.argv.length > 3) {
  commonConfigFile = process.argv[3];
}
console.log('commonConfigFile: ' + commonConfigFile);

if (process.argv.length > 4) {
  localConfigFile = process.argv[4];
}
console.log('localConfigFile: ' + localConfigFile);

// Read config files
let config;
try {
  if (!fs.existsSync(commonConfigFile)) {
    console.log(`${CONSOLE.Error}ERROR${CONSOLE.Reset} Failed to open COMMON config file: ${__dirname}/${commonConfigFile}`);
    process.exit(-1);
  }
  if (!fs.existsSync(localConfigFile)) {
    console.log(`${CONSOLE.Error}ERROR${CONSOLE.Reset} Failed to open LOCAL config file: ${__dirname}/${localConfigFile}`);
    process.exit(-1);
  }

  config = mergeYaml([commonConfigFile, localConfigFile]);
  console.log('localConfigFile: READ');

} catch (err) {
  console.error(`${CONSOLE.Error}ERROR${CONSOLE.Reset} Failed to read config: ${err}`);
  process.exit(-1);
}

// Get Git Version and print to console
let git_revision;
try {
  git_revision = gitRevision('short');
  console.log(`GIT revision: ${git_revision}`);
} catch (e) {
  console.log(`${CONSOLE.Error}ERROR${CONSOLE.Reset} GIT revision not found.`);
  git_revision = 'none';
}

// check data directory exists
const data_path = config.data_path || './data';
if (fs.existsSync(data_path)) {
  console.log(`Local data directory OK: ${data_path}`);
} else {
  console.log(`${CONSOLE.Warning}WARNING${CONSOLE.Reset} Local data directory missing: ${data_path}`);
  try {
    fs.mkdirSync(data_path);
    console.log(`Local data directory created: ${data_path}`);
  } catch {
    console.log(`${CONSOLE.Error}ERROR${CONSOLE.Reset} Failed to create local data directory: ${__dirname}/${data_path}`);
    process.exit(-1);
  }
}

console.log('=======================');
console.log('==== FETCHING DATA ====');

// Get access token
let access;
let token;

//request Access Token
request.post({
  url: config.sso_auth_url,
  form:
    {
      client_id: config.sso_auth_client_id,
      client_secret: config.sso_auth_client_secret,
      grant_type: config.sso_auth_grant_type,
      username: config.sso_auth_username,
      password: config.sso_auth_password
    }
}, function(err, httpResponse, body) {
  access = JSON.parse(body);
  token = access.access_token;
  // For each API data set defined in config request the data
  for (let i in config.arena_apis) {

    // extract details of this API data set
    api_properties = config.arena_apis[i];

    url = config.arena_rest_api_root_url + api_properties.url;
    filename = api_properties.file_name;
    x_version = api_properties.version;

    // put details of API call in a 'request' 'options' object
    // include file name as an extra item so we can use it later
    const options =
      {
        url: url,
        method: 'GET',
        headers:
          {
            'authorization': 'Bearer ' + token.toString(),
            'x-version': x_version.toString()
          },
        filename: filename
      };
    //console.log("request: " + JSON.stringify(options,4));

    // make the request for the data from the API
    request(options, function(err, res, body) {

      console.log('----------------------');
      console.log(options.url);
      console.log(options.filename);
      console.error('request error:', err); // Print the error if one occurred
      if (res.statusCode !== '200') {
        console.log(CONSOLE.Highlight + 'statusCode:', res && res.statusCode + CONSOLE.Reset);
      } else {
        console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
      }
      console.log('body size:', JSON.stringify(body).length); // Print the HTML for the Google homepage.

      //output file as JSON
      fs.writeFile(`${data_path}/${options.filename}.json.txt`, JSON.stringify(body), (err) => {
        if (err) {
          console.log(err); // Do something to handle the error or just throw it
          throw new Error(err);
        }
      });
      //output file as CSV
      const csvData = csvjson.toCSV(body, { headers: 'key' });
      fs.writeFile(`${data_path}/${options.filename}.csv`, csvData, (err) => {
        if (err) {
          console.log(err); // Do something to handle the error or just throw it
          throw new Error(err);
        }
      });
    }).pipe(fs.createWriteStream(`${data_path}/${filename}.json`));

  }
});

// TODO this needs to only fire once all the files have been down loaded
// TODO this requires promises on the request for data and the use of promise.all or similar

// SEND a MESSAGE to ARENA to say we just downloaded data for BCP
request.post({
  url: config.arena_rest_api_root_url + config.report_completion_url,
  headers:
    {
      'x-version': config.report_completion_version.toString()
    },
  form:
    {
      box: config.box_identifier,
      status: 'OK',
      rev: git_revision,
      message: 'TESTING: NODEJS version'
    }
}, function(err, res, body) {
  console.log('POSTED: ' + res.statusCode);
});


