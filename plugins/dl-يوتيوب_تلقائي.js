import axios from 'axios';

class Fuck extends Error {
    constructor(msg) {
        super(msg);
        this.name = "Fuck";
    }
}

class API {
    constructor(UploadVideo, Video2Gemini, AnalyzeVideo) {
        this.endpoints = { UploadVideo, Video2Gemini, AnalyzeVideo };
    }

    headers(custom = {}) {
        return {
            'Content-Type': 'application/json',
            'authority': new URL(this.endpoints.UploadVideo).host,
            'X-Forwarded-For': Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.'),
            ...custom
        };
    }

    handleError(e, context) {
        const youtubeUrl = e.response ? JSON.stringify(e.response.data || e.message) : e.message;
        console.error(`${context}:`, youtubeUrl);
        throw new Fuck(youtubeUrl);
    }
}

class Ask2YT extends API {
    constructor() { 
        super('https://youtubechat.agpallav.com/api/upload-video', 
              'https://youtubechat.agpallav.com/api/upload-to-gemini', 
              'https://youtubechat.agpallav.com/api/chat-with-video'); 
    }

    async request(endpoint, body) {
        try {
            const { data } = await axios.post(this.endpoints[endpoint], body, { headers: this.headers() });
            return data;
        } catch (e) { 
            this.handleError(e, endpoint); 
        }
    }

    async uploadVideo(youtubeUrl, audioOnly = false) {
        return this.request('UploadVideo', { youtubeUrl, audioOnly });
    }

    async upload2Gemini(downloadPath, mimeType) {
        return this.request('Video2Gemini', { downloadPath, mimeType });
    }

    async analyzeMedia(fileUri, messages, mimeType) {
        const { text } = await this.request('AnalyzeVideo', { uri: fileUri, mimeType, messages });
        return text;
    }

    async ask(youtubeUrl, question, type = 'video') {
        try {
            const audioOnly = type === 'audio';
            const { downloadPath } = await this.uploadVideo(youtubeUrl, audioOnly);
            const mimeType = audioOnly ? "audio/mp3" : "video/mp4"; 
            const fileUri = (await this.upload2Gemini(downloadPath, mimeType)).fileUri;
            const result = await this.analyzeMedia(fileUri, [question], mimeType);
            console.log(result);
            return result;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    }
}

export { Ask2YT };
