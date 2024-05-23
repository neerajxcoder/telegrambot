import { Telegraf, Markup } from 'telegraf'

import { message } from 'telegraf/filters'


import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'config';
const collec='sticker'
const collectionName = 'messages';
const bot = new Telegraf("");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
bot.start((ctx) => {
  ctx.reply('Welcome! Click a button:', Markup.inlineKeyboard([
    Markup.button.callback('Button 1', 'btn_1'),
    Markup.button.callback('Button 2', 'btn_2')
  ]));
});


client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    

    bot.on('sticker', async (ctx) => {
      if (ctx.chat.type === 'private') {
        ctx.reply('please enter cammand')
         return
       }
      const message = {
        chatId: ctx.chat.id,
        messageId: ctx.message.message_id,
        sticker: ctx.message.sticker,
        date: new Date(ctx.message.date * 1000)
      };

     
      const db = client.db(dbName);
      const collection = db.collection(collec);
      await collection.insertOne(message);
      const messages = await collection.find({}).toArray();
      const msg = messages.map(item => item.sticker).filter(Boolean);  // filter out any undefined or null values
      const chatId = ctx.message.chat.id;
      const messag = ctx.message;
      
      if (messag.reply_to_message) {
        return;
    }
      const randomIndex = Math.floor(Math.random() * msg.length);
     
      const replySticker = msg[randomIndex]; 
     
     
      await ctx.telegram.sendSticker(chatId, replySticker.file_id, {  // Use sendSticker for sticker replies
        reply_to_message_id: messag.message_id
        })
    });






    bot.on('message', async (ctx) => { 
      if (ctx.chat.type === 'private') {
       ctx.reply('please enter cammand')
        return;
      }
 
      const messageText = ctx.message.text;
    
      if (messageText.startsWith('null,undifine')) {
        return;
      }
      const message = {
        chatId: ctx.chat.id,
        messageId: ctx.message.message_id,
        text: ctx.message.text,
        date: new Date(ctx.message.date * 1000)
      };
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      await collection.insertOne(message);
      const messages = await collection.find({}).toArray();
      const msg =await messages.map(item => item.text);
      const chatId = await ctx.message.chat.id;
      const messag =  await ctx.message; 
      if (messag.reply_to_message) {
        return;
    }
      const randomIndex = Math.floor(Math.random() * msg.length);
      const replyMessage = msg[randomIndex]; 
      await ctx.telegram.sendMessage(chatId, replyMessage, {   
          reply_to_message_id: messag.message_id,
        parse_mode: 'HTML',
      })
    });
     bot.action('like', (ctx) => {
      ctx.reply('You liked the message');
    });
    bot.launch();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
