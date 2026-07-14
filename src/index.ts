import jsonStore from './core/store-json.js'
import mysqlStore from './core/store-mysql.js'
import mongoStore from './core/store-mongo.js'
import pgsqlStore from './core/store-pgsql.js'
import redisStore from './core/store-redis.js'
import sqliteStore from './core/store-sqlite.js'

const store = process.env?.USE_STORE?.includes('mysql')
    ? mysqlStore
    : process.env?.USE_STORE?.includes('mongo')
        ? mongoStore
        : (process.env?.USE_STORE?.includes('pgsql') || process.env?.USE_STORE?.includes('postgres'))
            ? pgsqlStore
            : process.env?.USE_STORE?.includes('redis')
                ? redisStore
                : process.env?.USE_STORE?.includes('sqlite')
                    ? sqliteStore
                    : jsonStore

export default store