const nodemailer = require('nodemailer');

exports.run = {
    usage: ['mail'],
    use: 'email | subject | message',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);

            client.sendReact(m.chat, '🕒', m.key);

            const [email, subject, msg] = text.split('|').map(str => str.trim());
            if (!email || !subject || !msg) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);

            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'no-reply@verify.lucifercloud.me',
                    pass: 'Ibrahim@109'
                }
            });

            const template = `
                <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="line-height: 2; letter-spacing: 0.5px; padding: 10px; border: 1px solid #DDD; border-radius: 14px;">
                        <h3 style="margin-top: 0;">Hi <b>${m.pushName} 😘</b> Welcome to Lucifer - MD, an awesome WhatsApp Bot!</h3>
                        <br><br>${msg}<br><br>
                        If you have any problem, please contact via <span style="color: #4D96FF;"><a href="https://api.whatsapp.com/send?phone=923229931076">WhatsApp</a></span><br>
                        <span>Regards,<br>Ibrahim</span>
                    </div>
                </div>
            `;

            const mailOptions = {
                from: {
                    name: 'Lucifer - MD (WhatsApp Bot)',
                    address: 'no-reply@verify.lucifercloud.me'
                },
                to: email,
                subject: subject,
                html: template
            };

            transporter.sendMail(mailOptions, function(err, data) {
                if (err) {
                    console.error(err);
                    client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                } else {
                    console.log('Email sent:', data.response);
                    client.reply(m.chat, `✅ Successfully sent email`, m);
                }
            });
        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    __filename
};
