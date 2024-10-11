import yts from 'yt-search';
import axios from 'axios';

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

const YTMate = async (data) => {
    if (!data.trim()) throw new Error('Gausah bertele tele, tinggal masukin aja link youtube atau query yg mau dicari...');
    const isLink = /youtu(\.)?be/.test(data);
    if (isLink) {
        const id = extractVid(data);
        if (!id) throw new Error('Error ceunah bree, ID nya gak adaa');
        const videoInfo = await info(id);
        const downloadLinks = await downloadLinks(id);
        return { type: 'download', download: { ...videoInfo, dl: downloadLinks } };
    } else {
        const videos = await search(data);
        return { type: 'search', query: data, total: videos.length, videos };
    }
};

export { YTMate };
