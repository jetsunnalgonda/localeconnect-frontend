const { defineConfig } = require('@vue/cli-service');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3011, // Set Vue development server to use port 3011
    https: {
      key: fs.readFileSync('./private.key'),
      cert: fs.readFileSync('./certificate.crt'),
    },
    proxy: {
      '/api': {
        target: 'https://192.168.1.2:3010', // Proxy requests to the backend server running on port 3010
        changeOrigin: true,
        secure: false, // Using self a signed certificate
        // https: true,
        pathRewrite: { '^/api': '' }, // Optionally rewrite the path if your backend doesn’t use the '/api' prefix
      },
    },
  },
});
