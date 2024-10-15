import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    text,
    command
}) => {
    if (!text) return m.reply("مرحبًا، كيف يمكنني مساعدتك اليوم؟");

    try {
        await m.reply("يرجى الانتظار...");

        const result = await CleanDx(text);
        await m.reply(result);
    } catch (error) {
        console.error(error);
        await m.reply("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.");
    }
};

handler.help = ["cleandx"];
handler.tags = ["internet"];
handler.command = /^(dx|bot|vcv)$/i;
export default handler;

async function CleanDx(your_qus) {
    const linkaiList = [];
    const linkaiId = generateRandomString(21);
    const Baseurl = "https://vipcleandx.xyz/";

    linkaiList.push({
        "content": your_qus,
        "role": "user",
        "nickname": "",
        "time": formatTime(),
        "isMe": true
    });

    linkaiList.push({
        "content": "جاري التفكير...",
        "role": "assistant",
        "nickname": "AI",
        "time": formatTime(),
        "isMe": false
    });

    if (linkaiList.length > 10) {
        linkaiList.shift();
    }

    const response = await fetch(Baseurl + "v1/chat/gpt/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": generateRandomIP(),
            "Referer": Baseurl,
            "accept": "application/json, text/plain, */*",
            "Accept-Language": "ar"
        },
        body: JSON.stringify({
            "list": linkaiList,
            "id": linkaiId,
            "title": your_qus,
            "prompt": "",
            "temperature": 0.5,
            "models": "0",
            "continuous": true
        })
    });

    return await response.text();
}

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}

function generateRandomIP() {
    const ipParts = [];
    for (let i = 0; i < 4; i++) {
        const randomPart = Math.floor(Math.random() * 256);
        ipParts.push(randomPart);
    }
    return ipParts.join('.');
}

function formatTime() {
    return moment().format('HH:mm:ss');
}
