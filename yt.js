import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const bot = new Telegraf('7135052956:AAFMeOFx7otirEzoOq1wIrW4TQsiB_k6-lU');

bot.start((ctx) => ctx.reply('Welcome! Send me a YouTube link with the command /play'));

bot.command('play', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) {
        return ctx.reply('Please provide a YouTube link.');
    }

    if (!ytdl.validateURL(url)) {
        return ctx.reply('Please provide a valid YouTube URL.');
    }

    ctx.reply('Downloading and processing your audio, please wait...');

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const audioStream = ytdl.downloadFromInfo(info, { format });

        const filePath = path.resolve('audio.mp3');
        const writeStream = fs.createWriteStream(filePath);

        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            ctx.replyWithAudio({ source: filePath }).then(() => {
                fs.unlinkSync(filePath); // Delete the file after sending
            });
        });

        writeStream.on('error', (error) => {
            console.error('Error writing audio file:', error);
            ctx.reply('An error occurred while processing your request.');
        });

    } catch (error) {
        console.error('Error downloading audio:', error);
        ctx.reply('An error occurred while processing your request.');
    }
});

bot.launch();
