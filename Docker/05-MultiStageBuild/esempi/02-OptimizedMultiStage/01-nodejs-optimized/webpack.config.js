const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/app.js',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'app.js',
    },
    optimization: {
      minimize: isProduction,
      usedExports: true,
      sideEffects: false,
    },
    plugins: [
      ...(process.env.ANALYZE_BUNDLE ? [new BundleAnalyzerPlugin()] : []),
    ],
    externals: {
      // Exclude node_modules from bundle
      express: 'commonjs express',
      helmet: 'commonjs helmet',
      compression: 'commonjs compression',
      cors: 'commonjs cors',
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
  };
};
