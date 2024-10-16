import yts from 'yt-search';
const { proto, generateWAMessageFromContent } = (await import('baileys')).default;

// معالجة البحث في YouTube باستخدام رسائل "عرض مرة واحدة"
let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) throw `✳️ أدخل كلمة مفتاحية للبحث عن فيديوهات YouTube.`;
    
    let results = await yts(text);
    let videos = results.videos;
    
    if (videos.length === 0) throw `🔍 لم يتم العثور على نتائج لكلمة "${text}"`;

    const data = {
        title: "نتائج البحث في YouTube",
        sections: videos.slice(0, 10).map((v) => ({
            title: v.title,
            rows: [
                {
                    header: "🎶تحميل كمقطع صوتي",
                    title: "",
                    description: `▢ 📌 *العنوان:* ${v.title}\n▢ ⌚ *المدة:* ${v.timestamp}\n`,
                    id: `${usedPrefix}ytmp3 ${v.url}`
                },
                {
                    header: "🎥تحميل كمقطع فيديو",
                    title: "",
                    description: `▢ 📌 *العنوان:* ${v.title}\n▢ ⌚ *المدة:* ${v.timestamp}\n`,
                    id: `${usedPrefix}ytmp4 ${v.url}`
                }
            ]
        }))
    };

    let msgs = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: `🎬 *نتائج البحث في YouTube*\n\nنتائج البحث عن: *${text}*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: '@967736615673'
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: '',
                        subtitle: "اختر الفيديو لتنزيل الخيارات",
                        hasMediaAttachment: false
                    }),
                    contextInfo: {
                        forwardingScore: 9999,
                        isForwarded: false,
                        mentionedJid: [m.sender],
                        quotedMessage: {
                            conversation: m.message?.conversation || ''
                        }
                    },
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            "name": "single_select",
                            "buttonParamsJson": JSON.stringify(data)
                        }]
                    })
                })
            }
        }
    }, {});

    conn.relayMessage(m.chat, msgs.message, { messageId: m.key.id });
};

handler.help = ['ytslist'];
handler.tags = ['dl'];
handler.command = ['بحث'];

export default handler;
