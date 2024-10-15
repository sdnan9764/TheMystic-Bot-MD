

import fetch from 'node-fetch';
import axios from "axios";

// Fungsi untuk mengirim prompt ke Sistem Yue
const sendToGemini = async (prompt) => {
    const apiKey = 'Isi-Apikey-you'; // Dapatkan apikey dari  https://aistudio.google.com/app/apikey
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            return data; 
        } else {
            throw new Error(data.error.message || 'Request failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};

// Handler untuk tomoe dengan Sistem Yue
let handler = async (m, { conn, isOwner, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(`Contoh: .tomoe hai manis`);
    }

    // Respond immediately with "tomoe sedang berfikir" before processing the request
    m.reply("tomoe sedang berfikir...");

    // Custom prompt for tomoe character behavior
    const prompt = `Nama kamu adalah tomoe, kamu adalah assisten virtual yang dikembangkan langsung dari google.`;

    const combinedPrompt = `${prompt} ${text}`; // Menggabungkan prompt custom dengan input user

    try {
        // Mengirim prompt ke API Gemini
        const response = await sendToGemini(combinedPrompt);

        if (response) {
            const candidates = response.candidates;
            let message = candidates && candidates.length > 0
                ? candidates[0].content.parts[0].text
                : 'Tidak ada respons yang diterima dari model.';

            // Mengganti ** dengan * dan mengedit jawaban jika perlu
            message = message.replace(/\*\*/g, '*').replace(/#{2,}/g, '#');

            // Mengirim respons dari Gemini ke user
            await conn.sendMessage(m.chat, { text: message }, { quoted: m });
        } else {
            await conn.sendMessage(
                m.chat,
                { text: 'Gagal mendapatkan respons dari Sistem Yue.' },
                { quoted: m }
            );
        }
    } catch (error) {
        console.error(error);
        await conn.sendMessage(
            m.chat,
            { text: 'Terjadi kesalahan saat memproses permintaan Anda.' },
            { quoted: m }
        );
    }
};

handler.help = ['tomoe'];
handler.tags = ['ai'];
handler.command = /^(gemini2)$/i;
handler.limit = true;

export default handler;