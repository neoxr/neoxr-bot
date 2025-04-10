"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultiFileAuthState = void 0;
const async_mutex_1 = require("async-mutex");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const WAProto_1 = require("../../WAProto");
const auth_utils_1 = require("./auth-utils");
const generics_1 = require("./generics");
// We need to lock files due to the fact that we are using async functions to read and write files
// https://github.com/WhiskeySockets/Baileys/issues/794
// https://github.com/nodejs/node/issues/26338
// Use a Map to store mutexes for each file path
const fileLocks = new Map();
// Get or create a mutex for a specific file path
const getFileLock = (path) => {
    let mutex = fileLocks.get(path);
    if (!mutex) {
        mutex = new async_mutex_1.Mutex();
        fileLocks.set(path, mutex);
    }
    return mutex;
};
/**
 * stores the full authentication state in a single folder.
 * Far more efficient than singlefileauthstate
 *
 * Again, I wouldn't endorse this for any production level use other than perhaps a bot.
 * Would recommend writing an auth state for use with a proper SQL or No-SQL DB
 * */
// export const useMultiFileAuthState = async (folder: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
// 	const writeData = (data: any, file: string) => {
// 		return writeFile(join(folder, fixFileName(file)!), JSON.stringify(data, BufferJSON.replacer))
// 	}
// 	const readData = async (file: string) => {
// 		try {
// 			const data = await readFile(join(folder, fixFileName(file)!), { encoding: 'utf-8' })
// 			return JSON.parse(data, BufferJSON.reviver)
// 		} catch (error) {
// 			return null
// 		}
// 	}
// 	const removeData = async (file: string) => {
// 		try {
// 			await unlink(join(folder, fixFileName(file)!))
// 		} catch {
// 		}
// 	}
// 	const folderInfo = await stat(folder).catch(() => { })
// 	if (folderInfo) {
// 		if (!folderInfo.isDirectory()) {
// 			throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
// 		}
// 	} else {
// 		await mkdir(folder, { recursive: true })
// 	}
// 	const fixFileName = (file?: string) => file?.replace(/\//g, '__')?.replace(/:/g, '-')
// 	const creds: AuthenticationCreds = await readData('creds.json') || initAuthCreds()
// 	return {
// 		state: {
// 			creds,
// 			keys: {
// 				get: async (type, ids) => {
// 					const data: { [_: string]: SignalDataTypeMap[typeof type] } = {}
// 					await Promise.all(
// 						ids.map(
// 							async id => {
// 								let value = await readData(`${type}-${id}.json`)
// 								if (type === 'app-state-sync-key' && value) {
// 									value = proto.Message.AppStateSyncKeyData.fromObject(value)
// 								}
// 								data[id] = value
// 							}
// 						)
// 					)
// 					return data
// 				},
// 				set: async (data) => {
// 					const tasks: Promise<void>[] = []
// 					for (const category in data) {
// 						for (const id in data[category]) {
// 							const value = data[category][id]
// 							const file = `${category}-${id}.json`
// 							tasks.push(value ? writeData(value, file) : removeData(file))
// 						}
// 					}
// 					await Promise.all(tasks)
// 				}
// 			}
// 		},
// 		saveCreds: () => {
// 			return writeData(creds, 'creds.json')
// 		}
// 	}
// }
const useMultiFileAuthState = async (folder) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeData = async (data, file) => {
        const filePath = (0, path_1.join)(folder, fixFileName(file));
        const mutex = getFileLock(filePath);
        return mutex.acquire().then(async (release) => {
            try {
                await (0, promises_1.writeFile)(filePath, JSON.stringify(data, generics_1.BufferJSON.replacer));
            }
            finally {
                release();
            }
        });
    };
    const readData = async (file) => {
        try {
            const filePath = (0, path_1.join)(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            return await mutex.acquire().then(async (release) => {
                try {
                    const data = await (0, promises_1.readFile)(filePath, { encoding: 'utf-8' });
                    return JSON.parse(data, generics_1.BufferJSON.reviver);
                }
                finally {
                    release();
                }
            });
        }
        catch (error) {
            return null;
        }
    };
    const removeData = async (file) => {
        try {
            const filePath = (0, path_1.join)(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            return mutex.acquire().then(async (release) => {
                try {
                    await (0, promises_1.unlink)(filePath);
                }
                catch (_a) {
                }
                finally {
                    release();
                }
            });
        }
        catch (_a) {
        }
    };
    const folderInfo = await (0, promises_1.stat)(folder).catch(() => { });
    if (folderInfo) {
        if (!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`);
        }
    }
    else {
        await (0, promises_1.mkdir)(folder, { recursive: true });
    }
    const fixFileName = (file) => { var _a; return (_a = file === null || file === void 0 ? void 0 : file.replace(/\//g, '__')) === null || _a === void 0 ? void 0 : _a.replace(/:/g, '-'); };
    const creds = await readData('creds.json') || (0, auth_utils_1.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}.json`);
                        if (type === 'app-state-sync-key' && value) {
                            value = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}.json`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            return writeData(creds, 'creds.json');
        }
    };
};
exports.useMultiFileAuthState = useMultiFileAuthState;
