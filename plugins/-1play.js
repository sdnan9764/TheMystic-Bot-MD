import yts from 'yt-search';
const { proto, generateWAMessageFromContent } = (await import('baileys')).default;

// Handler untuk pencarian YouTube dengan ViewOnce Messages
let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) throw `✳️ Masukkan kata kunci untuk mencari video YouTube.`;
    
    let results = await yts(text);
    let videos = results.videos;
    
    if (videos.length === 0) throw `🔍 Tidak ada hasil ditemukan untuk "${text}"`;

    const data = {
        title: "Hasil Pencarian YouTube",
        sections: videos.slice(0, 10).map((v) => ({
            title: v.title,
            rows: [
                {
                    header: "🎶 MP3",
                    title: "",
                    description: `▢ 📌 *Judul:* ${v.title}\n▢ ⌚ *Durasi:* ${v.timestamp}\n`,
                    id: `${usedPrefix}ytmp3 ${v.url}`
                },
                {
                    header: "🎥 MP4",
                    title: "",
                    description: `▢ 📌 *Judul:* ${v.title}\n▢ ⌚ *Durasi:* ${v.timestamp}\n`,
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
                        text: `🎬 *YOU TUBE SEARCH*\n\nHasil pencarian dari: *${text}*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: '@Ling Xuan'
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: '',
                        subtitle: "Pilih video untuk opsi unduh",
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
