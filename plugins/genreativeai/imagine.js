const { exec } = require('child_process');

const models = {
    'dreamshaperXL': 'dreamshaperXL10_alpha2.safetensors [c8afe2ef]',
    'dynavisionXL': 'dynavisionXL_0411.safetensors [c39cc051]',
    'juggernautXL': 'juggernautXL_v45.safetensors [e75f5471]',
    'realismEngineSDXL': 'realismEngineSDXL_v10.safetensors [af771c3f]',
    'sd_xl_base': 'sd_xl_base_1.0.safetensors [be9edd61]',
    'sd_xl_inpainting': 'sd_xl_base_1.0_inpainting_0.1.safetensors [5679a81a]',
    'turbovisionXL': 'turbovisionXL_v431.safetensors [78890989]'
};

exports.run = {
    usage: ['dreamshaperXL', 'dynavisionXL', 'juggernautXL', 'realismEngineSDXL', 'sd_xl_base', 'sd_xl_inpainting', 'turbovisionXL'],
    category: 'generativeai',
    async: async (m, { client, text, command }) => {
        try {
            if (!text) {
                return client.reply(m.chat, `Please provide a prompt. Example: /${command} "your prompt here"`, m);
            }

            switch (command) {
                case 'dreamshaperXL':
                    await handleModelGeneration('dreamshaperXL', text, client, m);
                    break;
                case 'dynavisionXL':
                    await handleModelGeneration('dynavisionXL', text, client, m);
                    break;
                case 'juggernautXL':
                    await handleModelGeneration('juggernautXL', text, client, m);
                    break;
                case 'realismEngineSDXL':
                    await handleModelGeneration('realismEngineSDXL', text, client, m);
                    break;
                case 'sd_xl_base':
                    await handleModelGeneration('sd_xl_base', text, client, m);
                    break;
                case 'sd_xl_inpainting':
                    await handleModelGeneration('sd_xl_inpainting', text, client, m);
                    break;
                case 'turbovisionXL':
                    await handleModelGeneration('turbovisionXL', text, client, m);
                    break;
                default:
                    client.reply(m.chat, 'Unknown command.', m);
            }
        } catch (e) {
            console.error('Error:', e);
            return client.reply(m.chat, 'An error occurred.', m);
        }
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
};

const handleModelGeneration = async (modelKey, promptText, client, message) => {
    const model = models[modelKey];
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "${model}",
            "prompt": "${promptText}",
            "negative_prompt": "badly drawn",
            "style_preset": "cinematic",
            "steps": 20,
            "cfg_scale": 7,
            "seed": -1,
            "sampler": "DPM++ 2M Karras",
            "width": 1024,
            "height": 1024
        }'`;

    exec(curlPostCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return client.reply(message.chat, `Failed to initiate image generation for ${modelKey}. Please try again.`, message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleImageResponse = (stdout, client, message, promptText) => {
    let postResponse;
    try {
        postResponse = JSON.parse(stdout);
    } catch (parseError) {
        console.error(`JSON parse error: ${parseError}`);
        return client.reply(message.chat, 'Error processing server response.', message);
    }

    const jobId = postResponse.job;
    client.reply(message.chat, 'Your image generation job has been created.');

    const pollStatus = async () => {
        try {
            const curlStatusCommand = `curl --request GET \
                --url https://api.prodia.com/v1/job/${jobId} \
                --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                --header 'accept: application/json'`;

            exec(curlStatusCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return client.reply(message.chat, 'Failed to fetch job status. Please try again.', message);
                }

                let statusResponse;
                try {
                    statusResponse = JSON.parse(stdout);
                } catch (parseError) {
                    console.error(`JSON parse error: ${parseError}`);
                    return client.reply(message.chat, 'Error processing status response.', message);
                }

                const status = statusResponse.status;
                if (status === 'succeeded') {
                    const imageUrl = statusResponse.imageUrl;
                    client.sendFile(message.chat, imageUrl, '', `◦  *Prompt* : ${promptText}`, message);
                } else if (status === 'failed') {
                    client.reply(message.chat, 'Image generation failed. Please try again.', message);
                } else {
                    setTimeout(pollStatus, 9000);
                }
            });
        } catch (e) {
            client.reply(message.chat, 'Error fetching job status.', message);
        }
    };

    pollStatus();
};
