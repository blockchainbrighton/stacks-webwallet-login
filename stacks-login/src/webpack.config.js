const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', // <-- Add this line
    entry: './src/index.js',
    output: {
        publicPath: '/',
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        static: './dist'
    },
    performance: { // <-- Add this section to handle the asset size warnings
        hints: process.env.NODE_ENV === 'production' ? "warning" : false
    }
};
