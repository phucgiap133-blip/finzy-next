module.exports = {
  apps: [
    {
      name: "finzy-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "cluster",
      instances: 1,
      env: { NODE_ENV: "production" },
    },
    {
      name: "finzy-worker",
      script: "node",
      args: "./node_modules/tsx/dist/cli.mjs src/worker/index.ts",
      exec_mode: "fork",
      instances: 1,
      env: { NODE_ENV: "production" },
    },
  ],
};
