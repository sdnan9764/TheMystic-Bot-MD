import yts from 'yt-search';
import axios from 'axios';

const api = [
    'https://cobalt.api.timelessnesses.me',
    'https://co.eepy.today',
    'https://dl.khyernet.xyz'
];

const rApi = () => api[Math.floor(Math.random() * api.length)];

const extractID = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:\S*?[?&]v=)|v\/|e\/|u\/\w+\/|embed\/|shorts\/)([\w-]{11})/);
    return match ? match[1] : null;
};

const request = async (videoId, downloadMode, quality = 720, format = 'mp3') => {
    const apiUrl = rApi();
    const payload = {
        url: `https://youtube.com/watch?v=${videoId}`,
        downloadMode
    };
    if (downloadMode === 'video') payload.videoQuality = quality;
    if (downloadMode === 'audio') payload.audioFormat = format;

    const response = await axios.post(`${apiUrl}/`, payload, {
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        }
    });

    if (response.status !== 200 || !response.data || response.data.status !== 'tunnel') {
        throw new Error('Terjadi kesalahan saat mengambil data 😮‍💨');
    }
    return response.data.url;
};

const CobaltClone = async (input, mode = 'search', options = {}) => {
    try {
        const terinput = input.trim();
        if (!terinput) throw new Error('Gak usah bertele tele, tinggal masukin link youtube atau query yang mau dicari .. ');

        if (mode === 'search') {
            const searchResults = await yts(terinput);
            const videos = searchResults.videos;

            return {
                type: 'search',
                videos: videos.map(v => ({
                    title: v.title,
                    id: v.videoId,
                    url: v.url,
                    media: { thumbnail: v.thumbnail, image: v.image },
                }))
            };
        } else {
            const videoId = extractID(terinput);
            if (!videoId) throw new Error('Link youtube nya gak valid...');

            const videoData = await yts({ videoId: videoId });
            console.log(videoData);
            if (!videoData) {
                throw new Error('Video nya gak ada btw 😊');
            }

            const video = videoData;
            console.log(video);
            const { title, description, thumbnail, image, seconds, views, author, url } = video;

            let download = {
                title,
                description,
                url,
                media: { thumbnail, image },
                duration: seconds,
                views,
                author
            };

            if (mode === 'video') {
                const videoUrl = await request(videoId, 'video', options.quality || 720);
                download.videoUrl = videoUrl;
            } else if (mode === 'audio') {
                const audioUrl = await request(videoId, 'audio', '1440p', options.format || 'mp3');
                download.audioUrl = audioUrl;
            }

            return {
                type: 'download',
                download,
            };
        }
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

export { CobaltClone };
