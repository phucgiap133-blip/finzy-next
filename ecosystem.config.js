// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "finzy-web",
      script: "npm",
      args: "start",
      cwd: ".",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "finzy-worker",
      script: "npm",
      args: "run worker",
      cwd: ".",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
