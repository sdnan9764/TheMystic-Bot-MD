import axios from 'axios';
import yts from 'yt-search';

const استخراج_معرف_الفيديو = (data) => {
    const match = /(?:youtu\.be\/|youtube\.com(?:.*[?&]v=|.*\/))([^?&]+)/.exec(data);
    return match ? match[1] : null;
};

const معلومات_الفيديو = async (id) => {
    const { title, description, url, videoId, seconds, timestamp, views, genre, uploadDate, ago, image, thumbnail, author } = await yts({ videoId: id });
    return { title, description, url, videoId, seconds, timestamp, views, genre, uploadDate, ago, image, thumbnail, author };
};

const روابط_التنزيل = async (id) => {
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

    if (!response.data || !response.data.links) throw new Error('لا يوجد رد من واجهة برمجة التطبيقات 😮‍💨 ');

    return Object.entries(response.data.links).reduce((acc, [format, links]) => {
        acc[format] = Object.fromEntries(Object.values(links).map(option => [
            option.q || option.f, 
            async () => {
                const res = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({ vid: id, k: option.k }), { headers });
                if (res.data.status !== 'ok') throw new Error('حدث خطأ في التحويل');
                return { size: option.size, format: option.f, url: res.data.dlink };
            }
        ]));
        return acc;
    }, { mp3: {}, mp4: {} });
};

const بحث = async (query) => {
    const videos = await yts(query).then(v => v.videos);
    return videos.map(({ videoId, views, url, title, description, image, thumbnail, seconds, timestamp, ago, author }) => ({
        title, id: videoId, url,
        media: { thumbnail: thumbnail || "", image },
        description, duration: { seconds, timestamp }, published: ago, views, author
    }));
};

const مقبض_التنزيل = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw (`*مثال الاستخدام:* ${usedPrefix + command} https://www.youtube.com/watch?v=example أو البحث باستخدام عنوان الفيديو.`);
    }

    m.reply("_☔يرجى الانتظار، جار المعالجة..._");

    try {
        const هو_رابط = /youtu(\.)?be/.test(text);
        
        if (هو_رابط) {
            const id = استخراج_معرف_الفيديو(text);
            if (!id) throw new Error('خطأ، لم يتم العثور على معرف الفيديو.');
            
            const معلومات_الفيديو_المعطاة = await معلومات_الفيديو(id);
            const روابط_التنزيل_المعطاة = await روابط_التنزيل(id);

            const { title, author, thumbnail, views, description, uploadDate } = معلومات_الفيديو_المعطاة;

            // الحصول على رابط تنزيل MP4
            const mp4DownloadFunc = روابط_التنزيل_المعطاة.mp4['360p'];
            const mp4Data = await mp4DownloadFunc();
            const mp4Url = mp4Data.url;

            const رسالة_المعلومات = `*🎬 معلومات فيديو YouTube*\n\n` +
                `*العنوان:* ${title}\n` +
                `*الكاتب:* ${author.name}\n` +
                `*الوصف:* ${description}\n` +
                `*تاريخ التحميل:* ${uploadDate}\n` +
                `*عدد المشاهدات:* ${views}\n` +
                `*رابط الفيديو:* ${text}\n\n` +
                `_سيتم إرسال الفيديو قريبًا..._`;

            await conn.sendMessage(m.chat, { 
                text: رسالة_المعلومات, 
                contextInfo: {
                    externalAdReply: {
                        title: `🎥 ${title}`,
                        body: `✍️ ${author.name}`,
                        thumbnail: await axios.get(thumbnail, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data, 'utf-8')),
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // إرسال الفيديو
            const رسالة_الفيديو = `*🎬 تم تنزيل الفيديو بنجاح*\n\n*العنوان:* ${title}\n*الكاتب:* ${author.name}`;

            await conn.sendMessage(m.chat, { 
                video: { url: mp4Url }, 
                mimetype: 'video/mp4', 
                caption: رسالة_الفيديو,
                contextInfo: {
                    externalAdReply: {
                        title: `🎥 ${title}`,
                        body: `✍️ ${author.name}`,
                        thumbnail: await axios.get(thumbnail, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data, 'utf-8')),
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        
        } else {
            // إذا كان الإدخال عبارة عن بحث
            const videos = await بحث(text);
            if (!videos.length) throw new Error('لم يتم العثور على أي فيديو لهذه البحث.');

            let نتائج_البحث = videos.slice(0, 5).map((v, i) => 
                `*${i + 1}.* ${v.title} (${v.duration.timestamp})\n    *الرابط:* ${v.url}\n    *عدد المشاهدات:* ${v.views}\n`
            ).join('\n\n');

            m.reply(`*نتائج البحث عن:* ${text}\n\n${نتائج_البحث}\n*استخدم الروابط لتحميل الفيديو!*`);
        }

    } catch (error) {
        console.error('خطأ:', error);
        m.reply('*⚠️ حدث خطأ أثناء معالجة الطلب.*');
    }
};

ponta.help = ['ytmp4'];
ponta.command = ['ytmp4', 'ytvideo', 'ytmp4dl'];
ponta.tags = ['downloader'];
export default ponta;
