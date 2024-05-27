import { Telegraf, Markup } from 'telegraf'
import fetch from 'node-fetch';
import { message } from 'telegraf/filters'
import cluster from 'cluster';
import os from 'os'
import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'config';
const collec='sticker'
const collectionName = 'messages';
 const bot = new Telegraf("7135052956:AAEEj6JEUnHNzSFWXQ1O7NxeBHOf7EILZ40");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
bot.start((ctx) => {
  ctx.reply('Welcome! Click a button:', Markup.inlineKeyboard([
    Markup.button.callback('Button 1', 'btn_1'),
    Markup.button.callback('Button 2', 'btn_2')
  ]));
});

bot.on('left_chat_member', async (ctx) => {
  try {
    const leftMember = ctx.message.left_chat_member;

    const escapeMarkdown = (text) => {
      return text.replace(/[_*[\]()~>#+\-=|{}.!\\]/g, '\\$&').replace(/`/g, '\\`').replace(/\./g, '\\.');
    };

    let tag;
    if (leftMember.username) {
      tag = `@${escapeMarkdown(leftMember.username)}`;
    } else {
      const fullName = `${escapeMarkdown(leftMember.first_name)}${leftMember.last_name ? ' ' + escapeMarkdown(leftMember.last_name) : ''}`;
      tag = `[${fullName}](tg://user?id=${leftMember.id})`;
    }

    const chatId = ctx.chat.id;
    const messageToSend = `${tag} has left the group\\. Goodbye\\!`;
    await ctx.telegram.sendMessage(chatId, messageToSend, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

bot.command('admin', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
  
      const member = await getChatMembers(chatId);

      if (member.length === 0) {
          ctx.reply('No members found.');
          return;
      }
   
      const escapeMarkdown = (text) => {
          return text.replace(/[_*[\]()~>#+\-=|{}.!]/g, '\\$&');
      };

      
    const tags = member.map(admin => {
      if (admin.username) {
        return `@${escapeMarkdown(admin.username)}`;
      } else {
        const fullName = `${escapeMarkdown(admin.first_name)}${admin.last_name ? ' ' + escapeMarkdown(admin.last_name) : ''}`;
        return `[${fullName}](tg://user?id=${admin.id})`;
      }
    }).join(' \n');

    ctx.replyWithMarkdownV2(tags);
   
  } catch (error) {
      console.error('Error getting chat members or sending message:', error);
      ctx.reply('An error occurred while trying to tag all members.');
  }
});

async function getChatMembers(chatId) {
  const url = `https://api.telegram.org/bot${'7135052956:AAEEj6JEUnHNzSFWXQ1O7NxeBHOf7EILZ40'}/getChatAdministrators?chat_id=${chatId}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.ok) {
      return data.result.map(admin => admin.user);
  } else {
      console.error('Failed to fetch chat members:', data);
      return [];
  }
}

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    bot.on('sticker', async (ctx) => {
      if (ctx.chat.type === 'private') {
        ctx.reply('please enter cammand')
         return
       }
       await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  const sticker = ctx.message.sticker;
   
      const message = {
        chatId: ctx.chat.id,
        messageId: ctx.message.message_id,
        sticker: ctx.message.sticker,
        date: new Date(ctx.message.date * 1000)
      };
     
      const db = client.db(dbName);
      const collection = db.collection(collec);
      const existingMessage = await collection.findOne({ 'sticker.file_unique_id':sticker.file_unique_id });
 if(!existingMessage) { 
        await collection.insertOne(message);
      }
      const messages = await collection.find({}).toArray();
      const msg = messages.map(item => item.sticker).filter(Boolean); 
      const chatId = ctx.message.chat.id;
      const messag = ctx.message;
      
      if (messag.reply_to_message) {
        if (messag.reply_to_message.from.is_bot) {
        } else {
          return;
        }  
    }
      const randomIndex = Math.floor(Math.random() * msg.length);
     
      const replySticker = msg[randomIndex]; 
 
      await ctx.telegram.sendSticker(chatId, replySticker.file_id, { 
        reply_to_message_id: messag.message_id
        })
    });

    bot.on('message', async (ctx) => { 
      if (ctx.chat.type === 'private') {
       
        return;
      }
      
   const messageText = ctx.message.text;
    
      if (messageText==='null,`undifine') {
        return;
      }
      await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
      const message = {
        chatId: ctx.chat.id,
        messageId: ctx.message.message_id,
        text: ctx.message.text,
        date: new Date(ctx.message.date * 1000)
      };
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const copy = await collection.findOne({text:messageText});
      if(!copy){
        await collection.insertOne(message);
      }

      const messages = await collection.find({}).toArray();
      const msg =await messages.map(item => item.text);
      const chatId = await ctx.message.chat.id;
      const messag =  await ctx.message; 
      if (messag.reply_to_message) {
        if (messag.reply_to_message.from.is_bot) {
        } else {
          return;
        }
      }
      const randomIndex = Math.floor(Math.random() * msg.length);
      const replyMessage = msg[randomIndex]; 
      await ctx.telegram.sendMessage(chatId, replyMessage, {   
          reply_to_message_id: messag.message_id,
        parse_mode: 'HTML',
      })
    });
  

    
  
    

    bot.launch().then(() => {
      console.log('Bot is up and running');
  }).catch((err) => {
      console.error('Failed to launch the bot:', err);
  });

   })