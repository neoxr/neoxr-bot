// FunkyMunky LMAO

module.exports = {
   apps: [{
      name: 'neoxr',
      script: './index.js',
      node_args: '--max-old-space-size=512', // Limit V8 heap to prevent JS memory leaks on a 1GB VPS
      max_memory_restart: '700M', // Restart app if real memory usage exceeds 700MB (leave room for OS)
      env: {
         NODE_ENV: 'production'
      },
      env_development: {
         NODE_ENV: 'development'
      }
   }]
}
