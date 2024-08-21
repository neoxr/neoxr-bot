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
    usage: ['imagine'],
    hidden: Object.keys(models),
    use: 'query <premium>',
    category: 'generativeai',
    async: async (m, { client, text, args, isPrefix, command, Func }) => {
        try {
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m);
            }

            if (command === 'imagine') {
                const sections = [{
                    rows: Object.keys(models).map(key => ({
                        title: key,
                        id: `${isPrefix}${key} ${text}`
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

            if (command === 'dreamshaperXL') {
                await handleDreamshaperXL(text, client, m);
            } else if (command === 'dynavisionXL') {
                await handleDynavisionXL(text, client, m);
            } else if (command === 'juggernautXL') {
                await handleJuggernautXL(text, client, m);
            } else if (command === 'realismEngineSDXL') {
                await handleRealismEngineSDXL(text, client, m);
            } else if (command === 'sd_xl_base') {
                await handleSdXlBase(text, client, m);
            } else if (command === 'sd_xl_inpainting') {
                await handleSdXlInpainting(text, client, m);
            } else if (command === 'turbovisionXL') {
                await handleTurbovisionXL(text, client, m);
            } else {
                return client.reply(m.chat, 'Command not recognized. Please select a valid model.', m);
            }
        } catch (e) {
            console.error('Error:', e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
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

const handleDreamshaperXL = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "dreamshaperXL10_alpha2.safetensors [c8afe2ef]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for DreamshaperXL. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleDynavisionXL = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "dynavisionXL_0411.safetensors [c39cc051]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for DynavisionXL. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleJuggernautXL = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "juggernautXL_v45.safetensors [e75f5471]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for JuggernautXL. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleRealismEngineSDXL = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "realismEngineSDXL_v10.safetensors [af771c3f]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for RealismEngineSDXL. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleSdXlBase = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "sd_xl_base_1.0.safetensors [be9edd61]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for SdXlBase. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleSdXlInpainting = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "sd_xl_base_1.0_inpainting_0.1.safetensors [5679a81a]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for SdXlInpainting. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleTurbovisionXL = async (promptText, client, message) => {
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "turbovisionXL_v431.safetensors [78890989]",
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
            return client.reply(message.chat, 'Failed to initiate image generation for TurbovisionXL. Please try again.', message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};
