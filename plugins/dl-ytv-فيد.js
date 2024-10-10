import ytdl from 'ytdl-core';
import fs from 'fs';
import os from 'os';

let limit = 500;
let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
  if (!args || !args[0]) throw `✳️ مثال:\n${usedPrefix + command} https://youtube.com/watch?v=GvabaWHngzU`;
  if (!args[0].match(/youtu/gi)) throw `❎ تحقق من رابط اليوتيوب`;

  let chat = global.db.data.chats[m.chat];
  try {
    const info = await ytdl.getInfo(args[0]);
    const format = ytdl.chooseFormat(info.formats, { quality: 'lowest' }); // تم تغيير 'highest' إلى 'lowest' لجودة 360 بكسل
    if (!format) {
      throw new Error('لم يتم العثور على تنسيقات صالحة');
    }

    if (format.contentLength / (1024 * 1024) >= limit) {
      return m.reply(`≡ *GURU YTDL*\n\n▢ *⚖️الحجم*: ${format.contentLength / (1024 * 1024).toFixed(2)}MB\n▢ *🎞️الجودة*: ${format.qualityLabel}\n\n▢ الملف يتجاوز الحد المسموح به *+${limit} MB*`);
    }

    const tmpDir = os.tmpdir();
    const fileName = `${tmpDir}/${info.videoDetails.videoId}.mp4`;

    const writableStream = fs.createWriteStream(fileName);
    ytdl(args[0], {
      quality: format.itag,
    }).pipe(writableStream);

    writableStream.on('finish', () => {
      conn.sendFile(
        m.chat,
        fs.readFileSync(fileName),
        `${info.videoDetails.videoId}.mp4`,
        `✼ ••๑⋯❀ Y O U T U B E ❀⋯⋅๑•• ✼

    ❏ العنوان: ${info.videoDetails.title}
    ❐ المدة الزمنية: ${info.videoDetails.lengthSeconds} ثانية
    ❑ المشاهدات: ${info.videoDetails.viewCount}
    ❒ التحميل: ${info.videoDetails.publishDate}
    ❒ الرابط: ${args[0]}

    ⊱─━⊱༻●༺⊰━─⊰`,
        m,
        false,
        { asDocument: chat.useDocument }
      );

      fs.unlinkSync(fileName); // حذف الملف المؤقت
    });

    writableStream.on('error', (error) => {
      console.error(error);
      m.reply('حدث خطأ أثناء محاولة تنزيل الفيديو. يرجى المحاولة مرة أخرى.');
    });
  } catch (error) {
    console.error(error);
    m.reply('حدث خطأ أثناء محاولة معالجة الفيديو. يرجى المحاولة مرة أخرى.');
  }
};

handler.help = ['ytmp4 <yt-link>'];
handler.tags = ['dl'];
handler.command = ['ytmp44', 'فيد'];
handler.diamond = false;

export default handler;
