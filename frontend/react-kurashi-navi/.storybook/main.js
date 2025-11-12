/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "storybook-addon-remix-react-router",
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config) {
    return {
      ...config,
      server: {
        ...config.server,
        proxy: {
          '/api': {
            target: 'https://t08pushtest.mydns.jp',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/kakeibo/public/api'),
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Proxying:', req.method, req.url);
              });
            }
          }
        }
      }
    };
  }
};
export default config;