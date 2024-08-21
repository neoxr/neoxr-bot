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
            // Step 1: If the command /imagine is given without text, prompt for text.
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m);
            }

            // Step 2: Debugging - Check the recognized command
            console.log(`Received command: ${command}`);

            // If the command doesn't match any model, suggest a correction
            if (!Object.keys(models).includes(command)) {
                const suggestions = Object.keys(models).map(key => `/${key} (${(similarity(command, key) * 100).toFixed(1)}%)`).join('\n➠ ');
                return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations:\n➠ ${suggestions}`, m);
            }

            // Step 3: When the user selects a model, execute the corresponding model command.
            client.sendReact(m.chat, '🕒', m.key);

            const selectedModel = models[command];
            const curlPostCommand = `curl --request POST \
                --url https://api.prodia.com/v1/sdxl/generate \
                --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                --header 'accept: application/json' \
                --header 'content-type: application/json' \
                --data '{
                    "model": "${selectedModel}",
                    "prompt": "${text}",
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
                    return client.reply(m.chat, 'Failed to initiate image generation. Please try again.', m);
                }

                const postResponse = JSON.parse(stdout);
                const jobId = postResponse.job;

                client.reply(m.chat, `Your image generation job has been created.`, m);

                const pollStatus = async () => {
                    try {
                        const curlStatusCommand = `curl --request GET \
                            --url https://api.prodia.com/v1/job/${jobId} \
                            --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                            --header 'accept: application/json'`;

                        exec(curlStatusCommand, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return client.reply(m.chat, 'Failed to fetch job status. Please try again.', m);
                            }

                            const statusResponse = JSON.parse(stdout);
                            const status = statusResponse.status;

                            if (status === 'succeeded') {
                                const imageUrl = statusResponse.imageUrl;
                                client.sendFile(m.chat, imageUrl, '', `◦  *Prompt* : ${text}`, m);
                            } else if (status === 'failed') {
                                client.reply(m.chat, 'Image generation failed. Please try again.', m);
                            } else {
                                setTimeout(pollStatus, 9000);
                            }
                        });
                    } catch (e) {
                        client.reply(m.chat, 'Error fetching job status.', m);
                    }
                };

                pollStatus();
            });
        } catch (e) {
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
};

// Utility function to calculate similarity between two strings
function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
