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
const bot = new Telegraf("7135052956:AAHxxzralRfXsmyEHf7VsmzxpKyKFLc52pY");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
bot.start((ctx) => {
  ctx.reply('Welcome! Click a button:', Markup.inlineKeyboard([
    Markup.button.callback('Button 1', 'btn_1'),
    Markup.button.callback('Button 2', 'btn_2')
  ]));
});




bot.command('tagall', async (ctx) => {
  const chatId = ctx.chat.id;

  // Get the custom message
  const customMessage = ctx.message.text.split(' ').slice(1).join(' ');
  if (!customMessage) {
      ctx.reply('Please provide a message to send.');
      return;
  }

  try {
      // Get chat members
      const members = await getChatMembers(chatId);

      if (members.length === 0) {
          ctx.reply('No members found.');
          return;
      }

      // Escape MarkdownV2 characters
      const escapeMarkdown = (text) => {
          return text.replace(/[_*[\]()~>#+\-=|{}.!]/g, '\\$&');
      };

      // Send message to each member one by one with 1 second delay
      for (let i = 0; i < members.length; i++) {
          const member = members[i];
          let tag;
          if (member.username) {
              tag = `@${escapeMarkdown(member.username)}`;
          } else {
              const fullName = `${escapeMarkdown(member.first_name)}${member.last_name ? ' ' + escapeMarkdown(member.last_name) : ''}`;
              tag = `[${fullName}](tg://user?id=${member.id})`;
          }

          const messageToSend =`${tag} ${escapeMarkdown(customMessage)}`;

         
          await new Promise(resolve => setTimeout(resolve, 500));
          ctx.replyWithMarkdownV2(messageToSend);
      }
  } catch (error) {
      console.error('Error getting chat members or sending message:', error);
      ctx.reply('An error occurred while trying to tag all members.');
  }
});

async function getChatMembers(chatId) {
  const url = `https://api.telegram.org/bot${'7135052956:AAHxxzralRfXsmyEHf7VsmzxpKyKFLc52pY'}/getChatAdministrators?chat_id=${chatId}`;
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
  


    if (cluster.isMaster) {
      // Master process
      const numCPUs = os.cpus().length;
  
      console.log(`Master ${process.pid} is running`);
  
      // Fork workers
      for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
      }
  
      cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died`);
          // Optionally, you can respawn a worker here
          cluster.fork();
      });
  }
  else {
    // Worker processes
    console.log(`Worker ${process.pid} started`);
    bot.launch().then(() => {
      console.log('Bot is up and running');
  }).catch((err) => {
      console.error('Failed to launch the bot:', err);
  });
}
  })