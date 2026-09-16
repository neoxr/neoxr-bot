"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let instance = null;
function resolveStore() {
    if (instance)
        return instance;
    const useStore = process.env?.USE_STORE || '';
    let mod;
    if (useStore.includes('mysql')) {
        mod = require('./core/store-mysql.js');
    }
    else if (useStore.includes('mongo')) {
        mod = require('./core/store-mongo.js');
    }
    else if (useStore.includes('pgsql') || useStore.includes('postgres')) {
        mod = require('./core/store-pgsql.js');
    }
    else if (useStore.includes('redis')) {
        mod = require('./core/store-redis.js');
    }
    else if (useStore.includes('sqlite')) {
        mod = require('./core/store-sqlite.js');
    }
    else {
        mod = require('./core/store-json.js');
    }
    instance = mod?.default || mod;
    return instance;
}
const store = new Proxy(Object.create(null), {
    get(_target, prop) {
        const target = resolveStore();
        const val = target[prop];
        return typeof val === 'function' ? val.bind(target) : val;
    },
    set(_target, prop, value) {
        const target = resolveStore();
        target[prop] = value;
        return true;
    },
    has(_target, prop) {
        const target = resolveStore();
        return prop in target;
    },
    ownKeys() {
        const target = resolveStore();
        return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_target, prop) {
        const target = resolveStore();
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }
});
exports.default = store;
//# sourceMappingURL=index.js.map