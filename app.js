const mongoose =require('mongoose')



const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

// Ensure the bot token is set correctly, using environment variables is a good practice for security.
const BOT_TOKEN = process.env.BOT || "";

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is not set!');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) =>{ctx.reply('Welcome')

   
});
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

  




  mongoose.connect('mongodb://127.0.0.1:27017/authtestapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  

  const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

const userSchema= new mongoose.Schema({
  telegramId:{ type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    username: String,
    dateJoined: { type: Date, default: Date.now },
    message: Object,
    chatId: String,
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },


  });
  
 const User=mongoose.model('user',userSchema) 


  bot.on('message', async (ctx) => {
    try {
        const message = ctx.message;
        const chatId = message.chat.id;
        const msgs = ctx.message.text;
         if (message.reply_to_message) {
            console.log('Message is a reply, skipping bot response');
            return;
        }

       // console.log('Received message:', msgs);
 let createUser = await User.update({
            telegramId: ctx.from.id,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            username: ctx.from.username,
            message,
            chatId,
        });
     
        //console.log('User created:', createUser);
        let users= User.find()
        console.log(users)
        var msg = ['hi', 'group', 'hello', 'chalaja', 'ayein'];
        const randomIndex = Math.floor(Math.random() * msg.length);
        const replyMessage = msg[randomIndex];
       // console.log('Replying with:', replyMessage);

        await ctx.telegram.sendMessage(chatId, replyMessage, {
            reply_to_message_id: message.message_id,
            parse_mode: 'HTML',
        });
    } catch (error) {
        console.error('Error creating user:', error);
        ctx.reply('An error occurred while processing your message.');
    }
});

bot.launch().then(() => {
    console.log('Bot launched successfully');
}).catch((error) => {
    console.error('Failed to launch the bot', error);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
