// 🤖 $SUGAR Telegram Bot Server
// Run with: node bot-server.js

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

// Bot Configuration
const BOT_TOKEN = '8586914157:AAGp9B3j_1o1oBtSgsBV9WHVirDAsEJJr3o';
const BOT_USERNAME = 'sugargent_Bot';
const WEBAPP_URL = 'https://sugar-token-platform--ShadowForge.replit.app';

// Middleware
app.use(bodyParser.json());

// 🎯 Bot Command Handlers
function handleStartCommand(userId, firstName, username) {
    return {
        text: `🎉 Welcome to $SUGAR Token Earning Platform, ${firstName || 'User'}! 🚀

💰 Start earning $SUGAR tokens by:
• Joining our Telegram community (+500 $SUGAR)
• Subscribing to our channel (+200 $SUGAR)
• Daily engagement (+1-3 $SUGAR per action)
• Referring friends (+1,000 $SUGAR per referral)

📊 Total Reward Pool: 10 Billion $SUGAR
🎯 Minimum for Airdrop: 10,000 $SUGAR

🔗 Click below to start earning:`,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🚀 Login to Website", web_app: { url: WEBAPP_URL } }
                ],
                [
                    { text: "📊 View Dashboard", web_app: { url: WEBAPP_URL + '?dashboard=true' } }
                ]
            ]
        }
    };
}

function handleHelpCommand(userId, firstName, username) {
    return {
        text: `❓ How to Earn $SUGAR Tokens

🚀 Getting Started:
1. Click "Login to Website" below
2. Connect your Solana wallet
3. Complete tasks to earn rewards

💰 Earning Methods:
• Join Telegram Group: +500 $SUGAR
• Subscribe to Channel: +200 $SUGAR
• Daily Engagement: +1-3 $SUGAR
• Referrals: +1,000 $SUGAR per referral

🎯 Requirements:
• Telegram login required
• Solana wallet connection
• Complete tasks for rewards

📞 Need more help? Contact support!`,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🚀 Start Earning", web_app: { url: WEBAPP_URL } }
                ]
            ]
        }
    };
}

function handleDefaultMessage(userId, firstName, username, messageText) {
    return {
        text: `👋 Hi ${firstName || 'User'}! Welcome to $SUGAR! 🚀

I'm here to help you earn $SUGAR tokens. Use these commands:

/start - 🎉 Start earning $SUGAR
/help - ❓ Get help and support

🚀 Ready to start earning? Click below!`,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🚀 Start Earning", web_app: { url: WEBAPP_URL } }
                ],
                [
                    { text: "❓ Need Help?", callback_data: "help" }
                ]
            ]
        }
    };
}

// 📤 Send Message to Telegram
function sendTelegramMessage(chatId, message) {
    const data = JSON.stringify({
        chat_id: chatId,
        ...message
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`Response: ${chunk}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(data);
    req.end();
}

// 🤖 Handle Bot Updates
function handleBotUpdate(update) {
    if (!update.message) return null;
    
    const message = update.message;
    const userId = message.from.id;
    const firstName = message.from.first_name;
    const username = message.from.username;
    const messageText = message.text;
    
    console.log(`Received message from ${firstName}: ${messageText}`);
    
    let response;
    
    if (messageText.startsWith('/start')) {
        response = handleStartCommand(userId, firstName, username);
    } else if (messageText.startsWith('/help')) {
        response = handleHelpCommand(userId, firstName, username);
    } else {
        response = handleDefaultMessage(userId, firstName, username, messageText);
    }
    
    if (response) {
        sendTelegramMessage(message.chat.id, response);
    }
}

// 🌐 Webhook Endpoint
app.post('/webhook', (req, res) => {
    console.log('Received webhook update:', JSON.stringify(req.body, null, 2));
    handleBotUpdate(req.body);
    res.status(200).send('OK');
});

// 🚀 Start Server
app.listen(port, () => {
    console.log('🤖 $SUGAR Bot Server Started');
    console.log(`🔗 Bot: @${BOT_USERNAME}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📡 Webhook: http://localhost:${port}/webhook`);
    console.log('✅ Ready to handle commands!');
});

// 🧪 Test Bot Connection
app.get('/test', (req, res) => {
    const testUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    
    https.get(testUrl, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            res.json(JSON.parse(data));
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
});

// 📋 Set Webhook (Manual)
app.get('/setwebhook', (req, res) => {
    const webhookUrl = `https://your-server-url.com/webhook`; // Replace with your server URL
    const setWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    
    https.get(setWebhookUrl, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            res.json(JSON.parse(data));
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
});

module.exports = app;
