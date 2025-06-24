const { override, addWebpackPlugin } = require('customize-cra');

module.exports = override(
  (config) => {
    // Fix webpack dev server configuration
    if (config.devServer) {
      config.devServer.allowedHosts = 'all';
    }
    return config;
  }
);
