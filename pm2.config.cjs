module.exports = {
   apps: [{
      name: 'neoxr',
      script: './index.js',
      node_args: '--max-old-space-size=1024',
      env: {
         NODE_ENV: 'production'
      },
      env_development: {
         NODE_ENV: 'development'
      }
   }]
}