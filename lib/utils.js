"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyAuthor = exports.noSuffix = void 0;
const noSuffix = (str) => (str?.includes(':') && str?.includes('@')) ? `${str.split('@')[0].split(':')[0]}@${str.split('@')[1]}` : str;
exports.noSuffix = noSuffix;
const getKeyAuthor = (key, meId = 'me') => ((key?.fromMe ? meId : (key?.senderPn || key?.participantPn || key.participant || key.remoteJid)) || '');
exports.getKeyAuthor = getKeyAuthor;
//# sourceMappingURL=utils.js.map