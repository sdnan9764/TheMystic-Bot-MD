

import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  conn.tinasha = conn.tinasha || {};

  if (!text) throw `*• مثال:* .شعبوط *[تفعيل/ايقاف]*`;

  if (text === "تفعيل") {
    if (conn.tinasha[m.chat]) {
      clearTimeout(conn.tinasha[m.chat].timeout);
    }
    conn.tinasha[m.chat] = { user: m.sender, pesan: [], timeout: setTimeout(() => delete conn.tinasha[m.chat], 3600000) }; // 1 hour timeout
    m.reply("[ ✓ ] لقد بدات الدردشة مع شعبوط");
  } else if (text === "ايقاف") {
    if (conn.tinasha[m.chat]) {
      clearTimeout(conn.tinasha[m.chat].timeout);
      delete conn.tinasha[m.chat];
      m.reply("[ ✓ ] انتهى الجلسة مع شعبوط.");
    } else {
      m.reply("[ ✓ ] Tidak ada sesi AI aktif.");
    }
  }
};

handler.before = async (m, { conn }) => {
  conn.tinasha = conn.tinasha || {};
  if (m.isBaileys || !m.text || !conn.tinasha[m.chat]) return;
  if (/^[.\#!\/\\]/.test(m.text)) return;
  if (m.sender !== conn.tinasha[m.chat].user) return; // Only allow the user who started the session

  await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

  try {
    const response = await fetch("https://luminai.my.id/", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: m.text,
        user: m.sender,
        prompt:'استخدم اللغه العربية في الرد على المستخدمين '
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    let result = res.result;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    result = result.replace(/\*\*/g, '*');
    m.reply(result);
    conn.tinasha[m.chat].pesan.push(m.text); // Store the message in pesan array
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply('Terjadi kesalahan saat memproses permintaan Anda.');
    console.error(error);
  }
};

handler.command = ['شعبوط'];
handler.tags = ['ai'];
handler.help = ['شعبوط *[تفعيل/ايقاف]*'];

export default handler;