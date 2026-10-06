const fs = require('fs')
const { execSync } = require('child_process')

const sh = (cmd, inherit = false) =>
   execSync(cmd, { stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'ignore'] }).toString().trim()

const has = c => { try { sh(`command -v ${c}`); return true } catch { return false } }

function findJemalloc() {
   for (const ld of ['ldconfig', '/sbin/ldconfig', '/usr/sbin/ldconfig']) {
      try {
         const line = sh(`${ld} -p`).split('\n').find(l => l.includes('libjemalloc.so.2'))
         const p = line && line.split('=>')[1]?.trim()
         if (p && fs.existsSync(p)) return p
      } catch { }
   }
   const dirs = [
      '/usr/lib/x86_64-linux-gnu', '/usr/lib/aarch64-linux-gnu',
      '/usr/lib64', '/usr/lib', '/usr/local/lib'
   ]
   for (const d of dirs) {
      for (const n of ['libjemalloc.so.2', 'libjemalloc.so']) {
         const p = `${d}/${n}`
         if (fs.existsSync(p)) return p
      }
   }
   return null
}

function installJemalloc() {
   const isRoot = process.getuid && process.getuid() === 0
   if (!isRoot && !has('sudo')) {
      console.warn('[jemalloc] not root and no sudo available, install skipped')
      return
   }
   const sudo = isRoot ? '' : 'sudo -n '
   try {
      if (has('apt-get')) sh(`${sudo}apt-get update -y && ${sudo}apt-get install -y libjemalloc2`, true)
      else if (has('dnf')) sh(`${sudo}dnf install -y epel-release && ${sudo}dnf install -y jemalloc`, true)
      else if (has('yum')) sh(`${sudo}yum install -y epel-release && ${sudo}yum install -y jemalloc`, true)
      else if (has('apk')) sh(`${sudo}apk add --no-cache jemalloc`, true)
      else console.warn('[jemalloc] unknown package manager')
   } catch (e) {
      console.warn('[jemalloc] install failed:', e.message)
   }
}

let lib = findJemalloc()
if (!lib) {
   console.log('[jemalloc] not found, trying to install...')
   installJemalloc()
   lib = findJemalloc()
}

const MEM_ENV = lib
   ? {
      LD_PRELOAD: lib,
      MALLOC_CONF: 'background_thread:true,narenas:1,dirty_decay_ms:30000,muzzy_decay_ms:30000'
   }
   : {
      MALLOC_ARENA_MAX: '1',
      MALLOC_TRIM_THRESHOLD_: '1048576',
      MALLOC_MMAP_THRESHOLD_: '1048576'
   }

console.log(lib ? `[jemalloc] active: ${lib}` : '[jemalloc] unavailable, using MALLOC_ARENA_MAX fallback')

module.exports = {
   apps: [{
      name: 'neoxr',
      script: './index.js',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      min_uptime: '60s',
      max_restarts: 10,
      exp_backoff_restart_delay: 2000,
      kill_timeout: 10000,
      merge_logs: true,
      time: false,
      node_args: '--max-old-space-size=512 --max-semi-space-size=32 --expose-gc',
      max_memory_restart: '700M',
      env: {
         NODE_ENV: 'production',
         UV_THREADPOOL_SIZE: '2',
         SHARP_CONCURRENCY: '1',
         ...MEM_ENV
      },
      env_development: {
         NODE_ENV: 'development',
         UV_THREADPOOL_SIZE: '2',
         SHARP_CONCURRENCY: '1',
         ...MEM_ENV
      }
   }]
}