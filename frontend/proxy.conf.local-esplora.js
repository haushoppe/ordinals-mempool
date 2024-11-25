const fs = require('fs');

const FRONTEND_CONFIG_FILE_NAME = 'mempool-frontend-config.json';

let configContent;

// Read frontend config
try {
    const rawConfig = fs.readFileSync(FRONTEND_CONFIG_FILE_NAME);
    configContent = JSON.parse(rawConfig);
    console.log(`${FRONTEND_CONFIG_FILE_NAME} file found, using provided config`);
} catch (e) {
    console.log(e);
    if (e.code !== 'ENOENT') {
      throw new Error(e);
  } else {
      console.log(`${FRONTEND_CONFIG_FILE_NAME} file not found, using default config`);
  }
}

console.log('** USING PROXY_CONFIG FROM proxy.conf.local-esplora.js ***');

let PROXY_CONFIG = [
  // HACK - this is just for local development, enter your own ord server here if available
  // {
  //   context: ['/content/**'],
  //   target: 'https://ordinals.com',
  //   secure: false,
  //   changeOrigin: true,
  //   proxyTimeout: 30000
  // },
  {
    context: ['/content/**'],
    target: `http://127.0.0.1:8999`,
    secure: false,
    changeOrigin: true,
    proxyTimeout: 30000
  },
  {
    context: ['/preview/**'],
    target: `http://127.0.0.1:8999`,
    secure: false,
    changeOrigin: true,
    proxyTimeout: 30000
  },
  {
    context: ['/r/**'],
    target: 'https://ordinals.com',
    secure: false,
    changeOrigin: true,
    proxyTimeout: 30000
  }
];

PROXY_CONFIG.push(...[
  {
    context: ['/testnet/api/v1/lightning/**'],
    target: `http://127.0.0.1:8999`,
    secure: false,
    changeOrigin: true,
    proxyTimeout: 30000,
    pathRewrite: {
        "^/testnet": ""
    },
  },
  {
    context: ['/api/v1/services/**'],
    target: `http://localhost:9000`,
    secure: false,
    ws: true,
    changeOrigin: true,
    proxyTimeout: 30000,
  },
  {
    context: ['/api/v1/**'],
    target: `http://127.0.0.1:8999`,
    secure: false,
    ws: true,
    changeOrigin: true,
    proxyTimeout: 30000,
  },
  {
    context: ['/api/**'],
    target: `http://127.0.0.1:3000`,
    secure: false,
    changeOrigin: true,
    proxyTimeout: 30000,
    pathRewrite: {
        "^/api": ""
    },
  }
]);

console.log(PROXY_CONFIG);

module.exports = PROXY_CONFIG;
