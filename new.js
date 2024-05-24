import { Telegraf, Markup } from 'telegraf'
import fetch from 'node-fetch';
import { message } from 'telegraf/filters'
const bot = new Telegraf("7135052956:AAHxxzralRfXsmyEHf7VsmzxpKyKFLc52pY");

bot.start((ctx) => {
    ctx.reply('Welcome! Click a button:', Markup.inlineKeyboard([
      Markup.button.callback('Button 1', 'btn_1'),
      Markup.button.callback('Button 2', 'btn_2')
    ]));
  });
  
  

  bot.launch()

