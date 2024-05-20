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
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch().then(() => {
    console.log('Bot launched successfully');
}).catch((error) => {
    console.error('Failed to launch the bot', error);
});
bot.command('quit', async (ctx) => {
    // Explicit usage
    await ctx.telegram.leaveChat(ctx.message.chat.id)
  
    // Using context shortcut
    await ctx.leaveChat()
  })
//   bot.on(message('text'), async (ctx) => {
//     // Explicit usage
//     await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)
  
//     // Using context shortcut
//     await ctx.reply(`Hello ${ctx.state.role}`)
//   })
bot.on('inline_query', async (ctx) => {
    const result = [
        "hi"
    ]
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)
  
    // Using context shortcut
    await ctx.answerInlineQuery(result)
  })
  
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
