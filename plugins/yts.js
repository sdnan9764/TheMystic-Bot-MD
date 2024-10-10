import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    const datas = global;
    const idioma = datas.db.data.users[m.sender].language;
    const _translate = JSON.parse(fs.readFileSync(`./language/ar.json`));
    const traductor = _translate.plugins.buscador_yts;
    const device = await getDevice(m.key.id);

    if (!text) throw `⚠️ *${traductor.texto1}*`;

    const results = await yts(text);
    const videos = results.videos.slice(0, 20);

    if (device !== 'desktop' || device !== 'web') {
        const randomIndex = Math.floor(Math.random() * videos.length);
        const randomVideo = videos[randomIndex];

        var messa = await prepareWAMessageMedia({ image: { url: randomVideo.thumbnail } }, { upload: conn.waUploadToServer });

        const interactiveMessage = {
            body: {
                text: `*النتائج التي تم الحصول عليها:* ${results.videos.length}\n*—◉ Video aleatorio:*\n*-› العنوان:* ${randomVideo.title}\n*-› القناة:* ${randomVideo.author.name}\n*-› المشاهدات:* ${randomVideo.views}\n*-› ${traductor.texto2[0]}:* ${randomVideo.url}\n*-› الصورة:* ${randomVideo.thumbnail}`.trim()
            },
            footer: { text: `${global.wm}`.trim() },
            header: {
                title: `*< نتائج البحث في اليوتيوب />*\n`,
                hasMediaAttachment: true,
                imageMessage: messa.imageMessage,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'اضغط هنا لتحميل الفيديو',
                            sections: videos.map((video) => ({
                                title: video.title,
                                rows: [
                                    {
                                        header: video.title,
                                        title: video.author.name,
                                        description: 'تحميل الفيديو MP4',
                                        id: `${prefijo}فيديو ${video.url}`
                                    }
                                ]
                            }))
                        })
                    },
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'اضغط هنا لتحميل الصوت',
                            sections: videos.map((video) => ({
                                title: video.title,
                                rows: [
                                    {
                                        header: video.title,
                                        title: video.author.name,
                                        description: 'تحميل الصوت MP3',
                                        id: `${prefijo}شغل ${video.url}`
                                    }
                                ]
                            }))
                        })
                    }
                ],
                messageParamsJson: ''
            }
        };

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage,
                },
            },
        }, { userJid: conn.user.jid, quoted: m });
        conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } else {
        const tes = results.all;
        const teks = results.all.map((v) => {
            switch (v.type) {
                case 'video': return `
° *_${v.title}_*
↳ 🫐 *_${traductor.texto2[0]}_* ${v.url}
↳ 🕒 *_${traductor.texto2[1]}_* ${v.timestamp}
↳ 📥 *_${traductor.texto2[2]}_* ${v.ago}
↳ 👁 *_${traductor.texto2[3]}_* ${v.views}`;
            }
        }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
        conn.sendFile(m.chat, tes[0].thumbnail, 'error.jpg', teks.trim(), m);
    }
};
handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^(بحث|yts|searchyt|تشغيل|تنزيل)$/i;
export default handler;
