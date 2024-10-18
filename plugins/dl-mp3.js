import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Fuck extends Error {
    constructor(msg) {
        super(msg);
        this.name = "Fuck";
    }
}


class API {
    constructor(details, downloads) {
        this.endpoints = { info: details, download: downloads };
    }

    headers(custom = {}) {
        return {
            'Content-Type': 'application/json',
            'User-Agent': 'Postify/1.0.0',
            'Referer': 'https://ytiz.xyz/',
            ...custom
        };
    }


    handleError(error, context) {
        const errors = error.response ? JSON.stringify(error.response.data || error.errors) : error.errors;
        console.error(`${context}:`, errors);
        throw new Fuck(errors);
    }
}


class YTMP3 extends API {
    constructor() { 
        super('https://m8.fly.dev/api/info', 'https://m8.fly.dev/api/download'); 
    }


    async request(endpoint, payload) {
        try {
            const { data } = await axios.post(this.endpoints[endpoint], payload, { headers: this.headers() });
            return data;
        } catch (error) { 
            this.handleError(error, endpoint); 
        }
    }

    async fetchDetails(videoUrl, format) {
        return this.request('info', { url: videoUrl, format, startTime: 0, endTime: 0 });
    }

    async downloadAudio(videoUrl, quality, filename, randomID, format) {
        return this.request('download', {
            url: videoUrl,
            quality,
            metadata: true,
            filename,
            randID: randomID,
            trim: false,
            startTime: 0,
            endTime: 0,
            format
        });
    }


    validParams(format, quality) {
        const formats = ['m4a', 'mp3', 'flac'];
        const qualities = ['32', '64', '128', '192', '256', '320'];

        if (!formats.includes(format)) {
            throw new Error(`Salah! Pilh salah satu opsi ini : ${formats.join(', ')}`);
        }

        if (!qualities.includes(quality)) {
            throw new Error(`Salah! Pilih salah satu opsi ini : ${qualities.join(', ')}`);
        }
    }

 
    async exec(videoUrl, format = 'mp3', quality = '128') {
        this.validParams(format, quality);

        const videoInfo = await this.fetchDetails(videoUrl, format);
        const audioData = await this.downloadAudio(videoUrl, quality, videoInfo.filename, videoInfo.randID, format);
        console.log(audioData);

        const outputDir = path.join(process.cwd(), 'downloads');
        const outputFilePath = path.join(outputDir, audioData.filename);
        this.dirExist(outputFilePath);

        const responseBlob = await axios.post('https://m8.fly.dev/api/file_send', {
            filepath: audioData.filepath,
            randID: audioData.randID
        }, { responseType: 'arraybuffer' });

        fs.writeFileSync(outputFilePath, responseBlob.data);
        console.log(`✅ Audio berhasil didownload: ${outputFilePath}`);
    }

    dirExist(filePath) {
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    }
    
    static async download(videoUrl, format = 'mp3', quality = '128') {
        const downloader = new YTMP3();
        await downloader.exec(videoUrl, format, quality).catch(err => {
            console.error(err.errors);
        });
    }
}

export { YTMP3 };
