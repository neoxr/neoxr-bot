import { Proxy } from '@neoxr/zapo'

const url = process?.env?.DATABASE_URL

const strategies = [
   { regex: /mongo/i, proxy: Proxy.proxyMongo, name: 'Mongo' },
   { regex: /postgres/i, proxy: Proxy.proxyPgSql, name: 'PostgreSQL' },
   { regex: /mysql/i, proxy: Proxy.proxyMySql, name: 'MySQL' },
   { regex: /redis/i, proxy: Proxy.proxyRedis, name: 'Redis' }
].find(({ regex }) => url && regex.test(url))

const selectedProxy = strategies?.proxy || Proxy.proxySqlite

export default {
   name: strategies?.name || 'SQLite',
   proxy: strategies?.proxy || Proxy.proxySqlite,
   init: (models, structure, filename = 'database', botId = null) => {
      return selectedProxy.init(models, structure, filename, botId)
   }
}