const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'config';
const collectionName = 'messages';
const bot = new Telegraf("");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
bot.start((ctx) => ctx.reply('bhn ka lo'))

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    bot.on('message', async (ctx) => {  
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
      const msg = messages.map(item => item.text);
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
    bot.launch();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
