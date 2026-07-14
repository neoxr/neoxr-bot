"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_json_js_1 = __importDefault(require("./core/store-json.js"));
const store_mysql_js_1 = __importDefault(require("./core/store-mysql.js"));
const store_mongo_js_1 = __importDefault(require("./core/store-mongo.js"));
const store_pgsql_js_1 = __importDefault(require("./core/store-pgsql.js"));
const store_redis_js_1 = __importDefault(require("./core/store-redis.js"));
const store_sqlite_js_1 = __importDefault(require("./core/store-sqlite.js"));
const store = process.env?.USE_STORE?.includes('mysql')
    ? store_mysql_js_1.default
    : process.env?.USE_STORE?.includes('mongo')
        ? store_mongo_js_1.default
        : (process.env?.USE_STORE?.includes('pgsql') || process.env?.USE_STORE?.includes('postgres'))
            ? store_pgsql_js_1.default
            : process.env?.USE_STORE?.includes('redis')
                ? store_redis_js_1.default
                : process.env?.USE_STORE?.includes('sqlite')
                    ? store_sqlite_js_1.default
                    : store_json_js_1.default;
exports.default = store;
//# sourceMappingURL=index.js.map