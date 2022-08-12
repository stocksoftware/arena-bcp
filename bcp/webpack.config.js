const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const serverConfig = {
    target: 'node',
    entry: {
        index: path.join(__dirname, "server/src/app.js"),
    },
    output: {
        path: path.resolve(__dirname, '../dist/server'),
        filename: 'server.js',
    }
}

const scriptConfig = {
    target: 'node',
    entry: {
        index: path.join(__dirname, "scripts/backup.js"),
    },
    output: {
        path: path.resolve(__dirname, '../dist/scripts'),
        filename: 'backup.js',
    }
}

const clientConfig = {
    entry: {
        index: path.join(__dirname, "client/src/webpack/index.js"),
    },
    output: {
        filename: "[name].[hash:4].js",
        path: path.join(__dirname, "../dist/client"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "client/template.html"),
            filename: 'index.html',
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.(css)$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(less)$/,
                use: ["style-loader", "css-loader", "less-loader"],
            },
            {
                test: /\.hbs$/, loader: 'handlebars-loader'
            },
            {
                test: /\.svg$/,
                oneOf: [
                    {
                        resourceQuery: /component/,
                        use: [
                            {
                                loader: 'babel-loader'
                            },
                            {
                                loader: 'react-svg-loader',
                                options: {
                                    jsx: true // true outputs JSX tags
                                }
                            }
                        ]
                    },
                    {
                        type: 'asset/source'
                    }
                ]

            },
            {
                test: /\.(png|jpg|gif)$/,
                type: 'asset/resource'
            }
        ]

    },
    devServer: {
        host: "localhost",
        port: "3000",
    },
    devtool: 'source-map'
}

module.exports = (env, argv) => [clientConfig, ...(argv.mode === 'production' ? [serverConfig, scriptConfig] : [])];

