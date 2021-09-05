import * as path from 'path';
import webpack from 'webpack';
import Dotenv from 'dotenv-webpack';
import TerserPlugin from 'terser-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlInlineScriptPlugin from 'html-inline-script-webpack-plugin';
import ngrok from 'ngrok';
import qrcode from 'qrcode-terminal';

const PRODUCTION = 'production';

const mode = process.env.NODE_ENV || PRODUCTION;
const isProd = mode === PRODUCTION;
export const debug = process.env.DEBUG || !isProd;

const OUTPUT_DIR = path.resolve('./public');

export default {
  mode,
  entry: {
    game: {
      import: './src/index.ts'
    }
  },
  output: {
    filename: '[name].js',
    path: OUTPUT_DIR,
    iife: false,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: 'source-map-loader',
      },
      {
        test: /\.(m?js|ts)$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs', '.ts'],
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2015,
          module: true,
          toplevel: true,
          compress: {
            passes: 5,
            drop_console: true,
            unsafe: true,
            unsafe_arrows: true,
            unsafe_math: true,
            unsafe_methods: true,
          },
          mangle: {
            module: true,
            properties: {
              keep_quoted: true,
              // socket.io functions
              reserved: ['connected', 'emit', 'off', 'once'],
            }
          }
        },
      }),
    ],
  },
  devtool: isProd ? false : 'source-map',
  devServer: {
    allowedHosts: [
      'localhost',
      '.ngrok.io'
    ],
    onListening({ options: { port } }) {
      ngrok.connect({ port })
        .then((url) => {
          console.log(`ngrok is running at ${url}`);
          qrcode.generate(url, {small: true});
        });
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEBUG': !isProd,
      MUGL_DEBUG: !isProd,
      NGL_ENABLE_BLEND: true,
      NGL_ENABLE_STENCIL: false,
      NGL_ENABLE_RASTER: false,
      NGL_ENABLE_OFFSCREEN: false,
      NGL_ENABLE_MRT: false,
      NGL_ENABLE_SCISSOR: false,
      NGL_ENABLE_TEXTURE: false,
    }),
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: './assets/index.html',
      inject: 'body',
      scriptLoading: 'blocking',
      minify: isProd ? {
        collapseWhitespace: true,
        keepClosingSlash: true,
        minifyCSS: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false,
    }),
    ...(isProd ? [
      new HtmlInlineScriptPlugin()
    ] : []),
  ],
};
