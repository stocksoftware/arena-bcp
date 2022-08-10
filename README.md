# Arena Map Lite

## Project Installation and Setup Instruction

1. Run `$ cd bcp`
2. The developer will need the following essential tools to run the project.
* [NodeJS](NodeJS.md): Javascript runtime environment and ecosystem. The current version of the project is in the [.node-version](.node-version) file.

3. Installation :  Run <code>$ yarn install</code>
4. To Start Sever: Run <code>$ yarn start</code>
5. To Visit App: <code>localhost:3000</code>


## Builds the app for production to the dist folder
`$ yarn build` creates a dist folder with a production build of your app.Set up a HTTP
server so that a visitor to your site is served <code>index.html</code>, and requests to static
paths like `/client/index.<hash>.js` are served 
with contents of the `/client/index.<hash>.js` file. For
Example, NodeJS contains a built-in HTTP server that can serve static files
<br/>
<code>$ cd bcp/server/src</code><br/>
<code>$ node app.js</code>


