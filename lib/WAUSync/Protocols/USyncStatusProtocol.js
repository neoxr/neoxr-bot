"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncStatusProtocol = void 0;
const WABinary_1 = require("../../WABinary");
class USyncStatusProtocol {
    constructor() {
        this.name = 'status';
    }
    getQueryElement() {
        return {
            tag: 'status',
            attrs: {},
        };
    }
    getUserElement() {
        return null;
    }
    parser(node) {
        var _a;
        if (node.tag === 'status') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            let status = node === null || node === void 0 ? void 0 : node.content.toString();
            const setAt = new Date(+((node === null || node === void 0 ? void 0 : node.attrs.t) || 0) * 1000);
            if (!status) {
                if (+((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.code) === 401) {
                    status = '';
                }
                else {
                    status = null;
                }
            }
            else if (typeof status === 'string' && status.length === 0) {
                status = null;
            }
            return {
                status,
                setAt,
            };
        }
    }
}
exports.USyncStatusProtocol = USyncStatusProtocol;
