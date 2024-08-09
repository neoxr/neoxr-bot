const nodemailer = require('nodemailer');

exports.run = {
    usage: ['reg'],
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            const user = global.db.users.find(v => v.jid == m.sender);
            if (user && user.verified) {
                return client.reply(m.chat, Func.texted('bold', `✅ Your number is already verified.`), m);
            }

            if (!args || !args[0]) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'alex80@gmail.com'), m);
            }

            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ig.test(args[0])) {
                return client.reply(m.chat, Func.texted('bold', '🚩 Invalid email.'), m);
            }

            const existingEmails = global.db.users.filter(v => v.email).map(v => v.email);
            if (existingEmails.includes(args[0])) {
                return client.reply(m.chat, Func.texted('bold', '🚩 Email already registered.'), m);
            }

            client.sendReact(m.chat, '🕒', m.key);

            const code = `${Func.randomInt(100, 900)}-${Func.randomInt(100, 900)}`;
            user.codeExpire = Date.now();
            user.code = code;
            user.email = args[0];

            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'no-reply@verify.lucifercloud.me',
                    pass: 'Ibrahim@109'
                }
            });

            const mailOptions = {
                from: {
                    name: 'Lucifer - MD',
                    address: 'no-reply@verify.lucifercloud.me'
                },
                to: args[0],
                subject: 'Lucifer - MD Email Verification',
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <div style="margin: auto; width: 600px;">
                            <div style="padding: 20px; border: 1px solid #DDD; border-radius: 14px;">
                                <h3>Hi <b>${m.pushName} 😘</b>, Welcome to Lucifer - MD!</h3>
                                <p>Send this code to the bot or it will expire in 3 minutes:</p>
                                <center><h1>${code}</h1></center>
                                <p>Or just click on the button below:</p>
                                <a style="display: block; width: 160px; margin: 30px auto; padding: 10px; border: 1px solid #00FFFA; border-radius: 14px; color: #FF5700; text-decoration: none; text-align: center; font-size: 1rem; font-weight: 500;" href="https://wa.me/${client.decodeJid(client.user.id).split('@')[0]}?text=${code}">Verify Your Account</a>
                                <p>If you have any problem, please contact via <a href="https://api.whatsapp.com/send?phone=923229931076">WhatsApp</a>.</p>
                                <p>Regards,<br>Ibrahim</p>
                            </div>
                        </div>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    return client.reply(m.chat, Func.texted('bold', `❌ Error sending email.`), m);
                }
                console.log('Email sent:', info.response);
                client.reply(m.chat, Func.texted('bold', `✅ Verification code sent to your email. Please check your inbox/spam folder. And send code to bot`), m);
            });
        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
   cache: true,
   location: __filename
};
