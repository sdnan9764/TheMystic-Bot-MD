
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

    if (!response.data || !response.data.links) throw new Error('Gak ada response dari api nya 😮‍💨 ');

    return Object.entries(response.data.links).reduce((acc, [format, links]) => {
        acc[format] = Object.fromEntries(Object.values(links).map(option => [
            option.q || option.f, 
            async () => {
                const res = await axios.post('https://id-y2mate.com/mates/convertV2/index', new URLSearchParams({ vid: id, k: option.k }), { headers });
                if (res.data.status !== 'ok') throw new Error('Cukup tau aja yak.. error bree');
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
        throw (`*Contoh Penggunaan:* ${usedPrefix + command} https://www.youtube.com/watch?v=example atau cari dengan judul video.`);
    }

    m.reply("_☔Tunggu sebentar, sedang memproses..._");

    try {
        const isLink = /youtu(\.)?be/.test(text);
        
        if (isLink) {
            const id = extractVid(text);
            if (!id) throw new Error('Error, ID video tidak ditemukan.');
            
            // Fetch video info
            const videoInfo = await info(id);
            const downloadLink = await downloadLinks(id);

            const { title, author, thumbnail, views, description, uploadDate } = videoInfo;

            // Fetch MP3 download link
            const mp3DownloadFunc = downloadLink.mp3['128kbps'];
            const mp3Data = await mp3DownloadFunc();
            const mp3Url = mp3Data.url;

            // Kirim informasi mengenai audio sebelum mengirim MP3
            const infoMessage = `*🎧 Info Audio YouTube*\n\n` +
                `*Judul:* ${title}\n` +
                `*Penulis:* ${author.name}\n` +
                `*Deskripsi:* ${description}\n` +
                `*Tanggal Upload:* ${uploadDate}\n` +
                `*Views:* ${views}\n` +
                `*Link Video:* ${text}\n\n` +
                `_Audionya segera dikirim..._`;

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

            // Kirim MP3 setelah memberikan informasi
            const audioMessage = `*🎧 Audio berhasil didownload*\n\n*Judul:* ${title}\n*Penulis:* ${author.name}`;

            await conn.sendMessage(m.chat, { 
                audio: { url: mp3Url }, 
                mimetype: 'audio/mpeg', 
                caption: audioMessage,
                ptt: false, // Set true jika ingin mengirim sebagai voice note (opsional)
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
            // Jika input berupa query pencarian, tampilkan hasil pencarian
            const videos = await search(text);
            if (!videos.length) throw new Error('Tidak ditemukan video untuk query tersebut.');

            let searchResults = videos.slice(0, 5).map((v, i) => 
                `*${i + 1}.* ${v.title} (${v.duration.timestamp})\n    *Link:* ${v.url}\n    *Views:* ${v.views}\n`
            ).join('\n\n');

            m.reply(`*Hasil pencarian untuk query:* ${text}\n\n${searchResults}\n*Gunakan link dari hasil pencarian untuk mendownload MP3!*`);
        }

    } catch (error) {
        console.error('Error:', error);
        m.reply('*⚠️ Terjadi kesalahan saat memproses permintaan Anda.*');
    }
};

handler.help = ['ytmp3'];
handler.command = ['ytmp3', 'ytaudio', 'ytmp3dl', 'yta'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
