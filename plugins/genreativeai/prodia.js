const { prodia } = require("gpti");

const models = {
    'edgeofrealism': "edgeOfRealism_eorV20.safetensors [3ed5de15]",
    'realisticvision': "Realistic_Vision_V5.0.safetensors [614d1063]",
    'majicmix': "majicmixRealistic_v4.safetensors [29d0de58]",
    'absolutereality': "absolutereality_v181.safetensors [3d9d4d2b]",
    'guofeng': "3Guofeng3_v34.safetensors [50f420de]",
    'cyberrealistic': "cyberrealistic_v33.safetensors [82b0d085]",
    'rundiffusionfx': "rundiffusionFX_v10.safetensors [cd4e694d]",
    'redshiftdiffusion': "redshift_diffusion-V10.safetensors [1400e684]",
    'amireal': "amIReal_V41.safetensors [0a8a2e61]",
    'lofi': "lofi_v4.safetensors [ccc204d6]",
    'epicrealism': "epicrealism_naturalSinRC1VAE.safetensors [90a4c676]",
    'photoreal': "ICantBelieveItsNotPhotography_seco.safetensors [4e7a3dfd]"
};

exports.run = {
    usage: ['txt2img'],
    hidden: Object.keys(models),
    use: 'prompt',
    category: 'generativeai',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            // Step 1: If the command is /txt2img without text, prompt for text.
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m);
            }

            // Step 2: If text is provided but no model is selected yet, prompt for model selection.
            if (!Object.keys(models).includes(command)) {
                const sections = [{
                    rows: Object.keys(models).map(key => ({
                        title: key,
                        id: `${isPrefix}${key} ${text}`  // Fixed string interpolation syntax
                    }))
                }];

                const buttonParamsJson = JSON.stringify({
                    title: 'Select a Model',
                    sections: sections
                });

                const buttons = [{ name: 'single_select', buttonParamsJson }];
                return await client.sendIAMessage(m.chat, buttons, m, {
                    header: 'Select a Model for Image Generation',
                    content: 'Choose one of the models below to generate an image.'
                });
            }

            // Step 3: When the user selects a model, execute the corresponding model command.
            client.sendReact(m.chat, '🕒', m.key);

            const model = models[command];
            const data_js = {
                prompt: text,
                data: {
                    model: model,
                    steps: 25,
                    cfg_scale: 7,
                    sampler: "DPM++ 2M Karras",
                    negative_prompt: "blurry, bad quality"  // Fixed typo "blury" to "blurry"
                }
            };

            prodia.v1(data_js, (err, data) => {
                if (err) {
                    console.log(err);
                    return client.reply(m.chat, 'Error generating image', m);
                }

                if (data.status && data.images && data.images.length > 0) {
                    const base64Image = data.images[0];
                    const imageBuffer = Buffer.from(base64Image.split(",")[1], 'base64');
                    client.sendFile(m.chat, imageBuffer, 'image.jpg', `*Prompt*: ${text}`, m);  // Fixed string interpolation syntax
                } else {
                    client.reply(m.chat, 'No image data received', m);
                }
            });
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, global.status.error, m);  // Moved this line inside the catch block
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
