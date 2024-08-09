

exports.run = {
    usage: ['xhmaster'],
    hidden: ['getxhmaster'],
    use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // Fetch search results from XHamster API
            let json = await Func.fetchJson(`https://lust.scathach.id/xhamster/search?key=${text}`);
            if (!json.success) return client.reply(m.chat, global.status.fail, m);

            // Prepare results
            const data = json.data;
            if (data.length === 0) {
                return client.reply(m.chat, 'No results found.', m);
            }

            // Prepare button sections for all results
            const sections = [];
            const buttonsPerSection = 5; // Adjust the number of buttons per section based on platform limits

            for (let i = 0; i < data.length; i += buttonsPerSection) {
                const rows = data.slice(i, i + buttonsPerSection).map((v) => ({
                    title: `${v.title}`,
                    id: `${isPrefix}ytdl ${v.link}` // ID for the button interaction
                }));

                sections.push({
                    rows
                });
            }

            const buttons = [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Select a Video',
                    sections: sections
                })
            }];

            const combinedCaption = "*X H M A S T E R   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below. Once you make a selection, the video link will be processed directly.";

            // Send the message with buttons for all results
            await client.sendIAMessage(m.chat, buttons, m, {
                header: '',
                content: combinedCaption
            });

        } catch (e) {
            console.log(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    premium: true
};
