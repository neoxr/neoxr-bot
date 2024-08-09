const fs = require('fs');
const { gpt } = require("gpti");

const userConversationsFile = 'user_conversations.json';

if (!fs.existsSync(userConversationsFile)) {
    fs.writeFileSync(userConversationsFile, '{}', 'utf8');
    console.log('user_conversations.json created successfully.');
}

let userConversations = {};

try {
    userConversations = JSON.parse(fs.readFileSync(userConversationsFile, 'utf8'));
    console.log('User conversations loaded.');
} catch (err) {
    console.error('Error loading user conversations:', err);
}

function cleanupOldConversations() {
    const now = Date.now();
    for (const userId in userConversations) {
        userConversations[userId].conversations = userConversations[userId].conversations.filter(
            msg => now - new Date(msg.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        if (userConversations[userId].conversations.length === 0) {
            delete userConversations[userId];
        }
    }
    fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
}

setInterval(cleanupOldConversations, 60 * 60 * 1000); // Run cleanup every hour

exports.run = {
    async: async (m, { client, isPrefix, command, Func }) => {
        try {
            const userId = `${m.chat}`;

            // Check if chatbot is enabled
            const setting = global.db.setting;

            if (!m.fromMe && !setting.chatbot) {
                return; // If chatbot is off, ignore the message
            }

            if (m.mtype === 'conversation' || m.mtype === 'extendedTextMessage') {
                if (m.text === '/newchat') {
                    // Clear conversation history for the user
                    if (userConversations[userId]) {
                        delete userConversations[userId];
                        fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
                        client.reply(m.chat, 'Your chat history has been cleared. You can start a new chat.', m);
                    }
                    // Remember that the user has used /newchat
                    userConversations[userId] = { conversations: [], messageCount: 0, newChat: true };
                    return;
                }

                // Check if user is new or returning
                if (!userConversations[userId]) {
                    userConversations[userId] = { conversations: [], messageCount: 0, newChat: false };
                    client.reply(m.chat, 'Welcome! You can start chatting. If you want to clear your conversation history, use /newchat.', m);
                }

                // Store user message
                userConversations[userId].conversations.push({ role: "user", content: m.text, timestamp: new Date() });

                const history = userConversations[userId].conversations;

                gpt.v1({
                    messages: history,
                    prompt: m.text, // Use the user's message directly
                    model: "GPT-4",
                    markdown: false
                }, (err, data) => {
                    if (err) {
                        console.error("GPT-4 API call error:", err);
                        client.reply(m.chat, 'There was an error processing your request. Please try again later.', m);
                    } else {
                        const response = data && data.gpt ? data.gpt : 'No response from GPT-4 API';
                        m.reply(response);

                        // Store assistant response
                        userConversations[userId].conversations.push({ role: "assistant", content: response, timestamp: new Date() });
                        fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
                    }
                });
            }
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, 'There was an error processing your request. Please try again later.', m);
        }
    },
    error: false,
    private: true,
    cache: true,
    premium: true,
    location: __filename
};
	