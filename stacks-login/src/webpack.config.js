const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', // <-- Add this line
    entry: './index.js',
    output: {
        publicPath: '/',
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ],
    devServer: {
        static: './dist',
        open: true, // This will automatically open the browser when you run npm run dev
        port: 8080 // Specify a port if you want. By default, it will use 8080
    },
    performance: { // <-- Add this section to handle the asset size warnings
        hints: process.env.NODE_ENV === 'production' ? "warning" : false
    }
};
