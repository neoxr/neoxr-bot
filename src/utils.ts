export const noSuffix = (str: string): string => (str?.includes(':') && str?.includes('@')) ? `${str.split('@')[0].split(':')[0]}@${str.split('@')[1]}` : str

export const getKeyAuthor = (key: any, meId: string = 'me') => (
    (key?.fromMe ? meId : (key?.senderPn || key?.participantPn || key.participant || key.remoteJid)) || ''
)