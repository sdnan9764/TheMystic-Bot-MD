import fetch from 'node-fetch';

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw "> *مرحبًا، أنا خدمة `Black Box Ai`، خدمة قادرة على برمجة الأكواد في جميع اللغات وحل مشاكل البرمجة. على سبيل المثال :*\n\n- #برمجة كيفية إنشاء صفحة تسجيل دخول باستخدام `html`";
  }

  try {
    const apiURL = `https://zoro-apis2-0a5bc82f5275.herokuapp.com/api/ai/blackbox?text=${encodeURIComponent(text)}&apikey=Zoro3mk`;
    const response = await fetch(apiURL);
    const result = await response.json();

    if (result.result && text.trim().length > 0) {
      await conn.sendFile(m.chat, 'https://telegra.ph/file/34bd1de01d59fb18833cc.jpg', 'image.png', result.result, m, { caption: text });
    } else if (result.result) {
      await conn.sendFile(m.chat, 'https://telegra.ph/file/34bd1de01d59fb18833cc.jpg', result.result, m);
    } else {
      throw '> *خطأ ⚠️: لم يتم العثور على نتيجة.*';
    }

  } catch (error) {
    console.error(error);
    throw '> *خطأ ⚠️: حدث خطأ أثناء الاتصال بالخدمة.*';
  }
};

handler.command = /^(برمجة|مساعد_برمجة|حل_برمجة|مولد_أكواد|كود)$/i;
handler.help = ['برمجة'];
handler.tags = ['أدوات'];
export default handler;

// بواسطة سعد - @nm9h
// شكرًا لخدمة Zoro API
