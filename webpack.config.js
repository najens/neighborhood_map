const path = require('path');
const SRC_DIR = path.resolve(__dirname, 'app');
const DIST_DIR = path.resolve(__dirname, 'docs')
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const config = {
    entry: [
        'tether',
        SRC_DIR + '/index.js'
    ],
    output: {
        path: DIST_DIR + '/',
        filename: 'js/bundle.js'
    },
    devServer: {
        contentBase: DIST_DIR,
        compress: true,
        port: 5000
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins() {
                                    return [precss, autoprefixer];
                                }
                            }
                        },
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8000, // Convert images < 8kb to base64 strings
                            name: 'img/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            ko: 'knockout',
            tether: 'tether',
            Tether: 'tether',
            'window.Tether': 'tether',
            Popper: ['popper.js', 'default'],
            'window.Tether': 'tether',
            // Bootstrap plugins
            Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
            Button: 'exports-loader?Button!bootstrap/js/dist/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
            Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
            Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
            Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
            Util: 'exports-loader?Util!bootstrap/js/dist/util'
        }),
        new CleanWebpackPlugin([DIST_DIR]),
        new UglifyJsPlugin(),
        new ExtractTextPlugin({
            filename: 'css/app.css'
        }),
        new CopyWebpackPlugin([
            {
                from:'app/img',
                to:'img'
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: SRC_DIR + '/index.html'
        })
    ]
};

module.exports = config;
