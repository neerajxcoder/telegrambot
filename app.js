const { log } = require('console');
const { default: test } = require('node:test');
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

// Ensure the bot token is set correctly, using environment variables is a good practice for security.
const BOT_TOKEN = process.env.BOT || "7135052956:AAFMeOFx7otirEzoOq1wIrW4TQsiB_k6-lU";

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is not set!');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));

bot.command('quit', async (ctx) => {

    await ctx.telegram.leaveChat(ctx.message.chat.id)
  
   
    await ctx.leaveChat()
  })
//   bot.on(message('text'), async (ctx) => {
//     // Explicit usage
//     await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)
   
//   })
bot.on('inline_query', async (ctx) => {
    const result = [
        "hi"
    ]
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)
  

    await ctx.answerInlineQuery(result)
  })

  

bot.on('message', async (ctx) => {
    const message = ctx.message;
    const chatId = message.chat.id;
    var msg=["सपना बिक गया, नींद कहाँ?",
    "अजीब सपना, चिपके रहो!",
    "आलसी दिन, आलसी मन!",
    "सोने का मोड़, बिना सोने!",
    "ख़ुशी का फंदा, हँसो बंदा!",
    "हंसते रहो, जिंदगी जियो!",
    "छुप गया, मजाक कहाँ?",
];
    const randomIndex = Math.floor(Math.random() * msg.length);
    const replyMessage = msg[randomIndex]
console.log(replyMessage)
    await ctx.telegram.sendMessage(chatId, replyMessage, {
        reply_to_message_id: message.message_id,
        parse_mode: 'HTML'
    });
});

bot.launch().then(() => {
    console.log('Bot launched successfully');
}).catch((error) => {
    console.error('Failed to launch the bot', error);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
