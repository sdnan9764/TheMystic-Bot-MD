import axios from 'axios';
import yts from 'yt-search';

const extractVid = (data) => {
    const match = /(?:youtu\.be\/|youtube\.com(?:.*[?&]v=|.*\/))([^?&]+)/.exec(data);
    return match ? match[1] : null;
};

const info = async (id) => {
    const { title, description, url, videoId, seconds, timestamp, views, genre, uploadDate, ago, image, thumbnail, author } = await yts({ videoId: id });
    return { title, description, url, videoId, seconds, timestamp, views, genre, uploadDate, ago, image, thumbnail, author };
};

const downloadLinks = async (id) => {
    const headers = {
        Accept: "*/*",
        Origin: "https://id-y2mate.com",
        Referer: `https://id-y2mate.com/${id}`,
        'User-Agent': 'Postify/1.0.0',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const response = await axios.post('https://id-y2mate.com/mates/analyzeV2/ajax', new URLSearchParams({
        k_query: `https://youtube.com/watch?v=${id}`,
        k_page: 'home',
        q_auto: 0,
    }), { headers });

    if (!response.data || !response.data.links) throw new Error('لم يتم الحصول على رد من الـ API 😮‍💨 ');

    return Object.entries(response.data.links).reduce((acc, [format, links]) => {
        acc[format] = Object.fromEntries(Object.values(links).map(option => [
            option.q || option.f, 
            async () => {
                const res = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({ vid: id, k: option.k }), { headers });
                if (res.data.status !== 'ok') throw new Error('خطأ غير متوقع...');
                return { size: option.size, format: option.f, url: res.data.dlink };
            }
        ]));
        return acc;
    }, { mp3: {}, mp4: {} });
};

const search = async (query) => {
    const videos = await yts(query).then(v => v.videos);
    return videos.map(({ videoId, views, url, title, description, image, thumbnail, seconds, timestamp, ago, author }) => ({
        title, id: videoId, url,
        media: { thumbnail: thumbnail || "", image },
        description, duration: { seconds, timestamp }, published: ago, views, author
    }));
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw (`*مثال للاستخدام:* ${usedPrefix + command} https://www.youtube.com/watch?v=example أو البحث باستخدام عنوان الفيديو.`);
    }

    m.reply("_☔ يرجى الانتظار قليلاً، يتم المعالجة..._");

    try {
        const isLink = /youtu(\.)?be/.test(text);
        
        if (isLink) {
            const id = extractVid(text);
            if (!id) throw new Error('خطأ، لم يتم العثور على معرف الفيديو.');

            // الحصول على معلومات الفيديو
            const videoInfo = await info(id);
            const downloadLink = await downloadLinks(id);

            const { title, author, thumbnail, views, description, uploadDate } = videoInfo;

            // الحصول على رابط تحميل MP3
            const mp3DownloadFunc = downloadLink.mp3['128kbps'];
            const mp3Data = await mp3DownloadFunc();
            const mp3Url = mp3Data.url;

            // إرسال معلومات الفيديو قبل إرسال MP3
            const infoMessage = `*🎧 معلومات الصوت من YouTube*\n\n` +
                `*العنوان:* ${title}\n` +
                `*المؤلف:* ${author.name}\n` +
                `*الوصف:* ${description}\n` +
                `*تاريخ النشر:* ${uploadDate}\n` +
                `*المشاهدات:* ${views}\n` +
                `*رابط الفيديو:* ${text}\n\n` +
                `_سيتم إرسال الصوت قريباً..._`;

            await conn.sendMessage(m.chat, { 
                text: infoMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: `🎵 ${title}`,
                        body: `✍️ ${author.name}`,
                        thumbnail: await axios.get(thumbnail, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data, 'utf-8')),
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // إرسال MP3 بعد تقديم المعلومات
            const audioMessage = `*🎧 تم تحميل الصوت بنجاح*\n\n*العنوان:* ${title}\n*المؤلف:* ${author.name}`;

            await conn.sendMessage(m.chat, { 
                audio: { url: mp3Url }, 
                mimetype: 'audio/mpeg', 
                caption: audioMessage,
                ptt: false, // قم بتعيين true إذا كنت ترغب في إرساله كرسالة صوتية (اختياري)
                contextInfo: {
                    externalAdReply: {
                        title: `🎵 ${title}`,
                        body: `✍️ ${author.name}`,
                        thumbnail: await axios.get(thumbnail, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data, 'utf-8')),
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        
        } else {
            // إذا كان المدخل عبارة عن استعلام بحث، يتم عرض نتائج البحث
            const videos = await search(text);
            if (!videos.length) throw new Error('لم يتم العثور على فيديوهات لهذه الكلمة.');

            let searchResults = videos.slice(0, 5).map((v, i) => 
                `*${i + 1}.* ${v.title} (${v.duration.timestamp})\n    *رابط:* ${v.url}\n    *المشاهدات:* ${v.views}\n`
            ).join('\n\n');

            m.reply(`*نتائج البحث عن:* ${text}\n\n${searchResults}\n*استخدم الرابط من نتائج البحث لتنزيل MP3!*`);
        }

    } catch (error) {
        console.error('Error:', error);
        m.reply('*⚠️ حدث خطأ أثناء معالجة طلبك.*');
    }
};

handler.help = ['ytmp3'];
handler.command = ['ytmp3', 'ytaudio', 'ytmp3dl', 'yta'];
handler.tags = ['downloader'];
export default handler;
