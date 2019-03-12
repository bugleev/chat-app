const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("./build-utils/plugins/InlineChunkHtmlPlugin");
const getCSSModuleLocalIdent = require("./build-utils/plugins/getCSSModuleLocalIdent");
const InterpolateHtmlPlugin = require("./build-utils/plugins/InterpolateHtmlPlugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const path = require("path");

const paths = require("./build-utils/paths");
const getClientEnvironment = require("./build-utils/env");
const loadPresets = require("./build-utils/presets/loadPresets");

const modeConfig = env => require(`./build-utils/webpack.${env.mode}.js`)(env);
require(`./build-utils/copyFiles`)();

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = ({ mode, presets } = { mode: "production", presets: [] }) => {
  const isEnvProduction = mode === "production";

  const publicPath = isEnvProduction ? paths.servedPath : "/";

  const publicUrl = isEnvProduction ? publicPath.slice(0, -1) : "";
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === "./";
  // common function to get style loaders
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      !isEnvProduction && require.resolve("style-loader"),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: Object.assign(
          {},
          shouldUseRelativeAssetPaths ? { publicPath: "../../" } : undefined
        )
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve("postcss-loader"),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: "postcss",
          plugins: () => [
            require("postcss-flexbugs-fixes"),
            require("postcss-preset-env")({
              autoprefixer: {
                flexbox: "no-2009"
              },
              stage: 3
            })
          ],
          sourceMap: false
        }
      }
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: false
        }
      });
    }
    return loaders;
  };
  return webpackMerge(
    {
      mode,
      stats: {
        // copied from `'minimal'`
        all: false,
        assets: true,
        builtAt: true,
        modules: true,
        maxModules: 0,
        errors: true,
        warnings: true,
        // our additional options
        moduleTrace: true,
        errorDetails: true
      },
      entry: [paths.appIndexJs].filter(Boolean),
      optimization: {
        // Automatically split vendor and commons
        // https://twitter.com/wSokra/status/969633336732905474
        // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
        splitChunks: {
          chunks: "all",
          name: false
        },
        // Keep the runtime chunk separated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        runtimeChunk: true
      },
      resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We placed these paths second because we want `node_modules` to "win"
        // if there are any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebook/create-react-app/issues/253
        modules: ["node_modules"].concat(
          // It is guaranteed to exist because we tweak it in `env.js`
          process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
        ),
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebook/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: paths.moduleFileExtensions.map(ext => `.${ext}`),
        alias: {
          // Support React Native Web
          // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
          "react-native": "react-native-web"
        }
      },
      module: {
        strictExportPresence: true,
        rules: [
          // Disable require.ensure as it's not a standard language feature.
          { parser: { requireEnsure: false } },
          {
            // "oneOf" will traverse all following loaders until one will
            // match the requirements. When no loader matches it will fall
            // back to the "file" loader at the end of the loader list.
            oneOf: [
              // "url" loader works like "file" loader except that it embeds assets
              // smaller than specified limit in bytes as data URLs to avoid requests.
              // A missing `test` is equivalent to a match.
              {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve("url-loader"),
                options: {
                  limit: 10000,
                  name: "static/media/[name].[hash:8].[ext]"
                }
              },
              // Process application JS with Babel.
              // The preset includes JSX, Flow, TypeScript, and some ESnext features.
              {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                include: paths.appSrc,
                loader: require.resolve("babel-loader"),
                options: {
                  presets: ["@babel/preset-react"],
                  plugins: [
                    [
                      require.resolve("babel-plugin-named-asset-import"),
                      {
                        loaderMap: {
                          svg: {
                            ReactComponent:
                              "@svgr/webpack?-prettier,-svgo![path]"
                          }
                        }
                      }
                    ],
                    "@babel/plugin-syntax-dynamic-import",
                    ["@babel/plugin-proposal-decorators", { legacy: true }],
                    ["@babel/plugin-proposal-class-properties", { loose: true }]
                  ],
                  // This is a feature of `babel-loader` for webpack (not Babel itself).
                  // It enables caching results in ./node_modules/.cache/babel-loader/
                  // directory for faster rebuilds.
                  cacheDirectory: true,
                  cacheCompression: isEnvProduction,
                  compact: isEnvProduction
                }
              },
              // Process any JS outside of the app with Babel.
              // Unlike the application JS, we only compile the standard ES features.
              {
                test: /\.(js|mjs)$/,
                exclude: /@babel(?:\/|\\{1,2})runtime/,
                loader: require.resolve("babel-loader"),
                options: {
                  babelrc: false,
                  configFile: false,
                  compact: false,
                  cacheDirectory: true,
                  cacheCompression: isEnvProduction,

                  // If an error happens in a package, it's possible to be
                  // because it was compiled. Thus, we don't want the browser
                  // debugger to show the original code. Instead, the code
                  // being evaluated would be much more helpful.
                  sourceMaps: false
                }
              },
              // "postcss" loader applies autoprefixer to our CSS.
              // "css" loader resolves paths in CSS and adds assets as dependencies.
              // "style" loader turns CSS into JS modules that inject <style> tags.
              // In production, we use MiniCSSExtractPlugin to extract that CSS
              // to a file, but in development "style" loader enables hot editing
              // of CSS.
              // By default we support CSS Modules with the extension .module.css
              {
                test: cssRegex,
                exclude: cssModuleRegex,
                use: getStyleLoaders({
                  importLoaders: 1,
                  sourceMap: false
                }),
                // Don't consider CSS imports dead code even if the
                // containing package claims to have no side effects.
                // Remove this when webpack adds a warning or an error for this.
                // See https://github.com/webpack/webpack/issues/6571
                sideEffects: true
              },
              // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
              // using the extension .module.css
              {
                test: cssModuleRegex,
                use: getStyleLoaders({
                  importLoaders: 1,
                  sourceMap: false,
                  modules: true,
                  getLocalIdent: getCSSModuleLocalIdent
                })
              },
              // Opt-in support for SASS (using .scss or .sass extensions).
              // By default we support SASS Modules with the
              // extensions .module.scss or .module.sass
              {
                test: sassRegex,
                exclude: sassModuleRegex,
                use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    sourceMap: false
                  },
                  "sass-loader"
                ),
                // Don't consider CSS imports dead code even if the
                // containing package claims to have no side effects.
                // Remove this when webpack adds a warning or an error for this.
                // See https://github.com/webpack/webpack/issues/6571
                sideEffects: true
              },
              // Adds support for CSS Modules, but using SASS
              // using the extension .module.scss or .module.sass
              {
                test: sassModuleRegex,
                use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    sourceMap: false,
                    modules: true,
                    getLocalIdent: getCSSModuleLocalIdent
                  },
                  "sass-loader"
                )
              },
              // "file" loader makes sure those assets get served by WebpackDevServer.
              // When you `import` an asset, you get its (virtual) filename.
              // In production, they would get copied to the `build` folder.
              // This loader doesn't use a "test" so it will catch all modules
              // that fall through the other loaders.
              {
                loader: require.resolve("file-loader"),
                // Exclude `js` files to keep "css" loader working as it injects
                // its runtime that would otherwise be processed through "file" loader.
                // Also exclude `html` and `json` extensions so they get processed
                // by webpacks internal loaders.
                exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                options: {
                  name: "static/media/[name].[hash:8].[ext]"
                }
              }
              // ** STOP ** Are you adding a new loader?
              // Make sure to add the new loader(s) before the "file" loader.
            ]
          }
        ]
      },
      plugins: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              inject: true,
              template: paths.appHtml,
              favicon: "./public/favicon.png"
            },
            isEnvProduction
              ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true
                  }
                }
              : undefined
          )
        ),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
        new webpack.DefinePlugin(env.stringified)
      ].filter(Boolean),
      // Some libraries import Node modules but don't use them in the browser.
      // Tell Webpack to provide empty mocks for them so importing them works.
      node: {
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
      }
      // Turn off performance processing because we utilize
      // our own hints via the FileSizeReporter
    },
    modeConfig({ mode, presets }),
    loadPresets({ mode, presets })
  );
};
