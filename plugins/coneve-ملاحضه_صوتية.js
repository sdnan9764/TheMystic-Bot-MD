import { toPTT } from '../lib/converter.js';
import fs from 'fs';

// تعريف المعالج الذي سيقوم بتنفيذ الوظيفة
const handler = async (m, { conn, usedPrefix, command }) => {
  const datas = global;  // الحصول على البيانات العامة
  const idioma = datas.db.data.users[m.sender].language;  // الحصول على لغة المستخدم
  const _translate = JSON.parse(fs.readFileSync(`./language/ar.json`));  // تحميل ملف الترجمة المناسب للغة
  const tradutor = _translate.plugins.convertidor_toptt;  // استخراج النصوص المترجمة

  const q = m.quoted ? m.quoted : m;  // التحقق من وجود رسالة مقتبسة
  const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';  // الحصول على نوع MIME للرسالة
  if (!/video|audio/.test(mime)) throw `*${tradutor.texto1}*`;  // التحقق من أن الملف هو فيديو أو صوت
  const media = await q.download?.();  // تنزيل الملف المرفق
  if (!media && !/video/.test(mime)) throw `*${tradutor.texto2}*`;  // إذا لم يتم تنزيل الملف ولم يكن فيديو، اطرح خطأ
  if (!media && !/audio/.test(mime)) throw `*${tradutor.texto3}*`;  // إذا لم يتم تنزيل الملف ولم يكن صوت، اطرح خطأ
  const audio = await toPTT(media, 'mp4');  // تحويل الملف إلى نمط PTT
  if (!audio.data && !/audio/.test(mime)) throw `*${tradutor.texto4}*`;  // إذا لم يكن الناتج صوتي، اطرح خطأ
  if (!audio.data && !/video/.test(mime)) throw `*${tradutor.texto5}*`;  // إذا لم يكن الناتج فيديو، اطرح خطأ
  const aa = conn.sendFile(m.chat, audio.data, 'error.mp3', '', m, true, { mimetype: 'audio/mpeg' });  // إرسال الملف المحول إلى الدردشة
  if (!aa) return conn.sendMessage(m.chat, { audio: { url: media }, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });  // إذا فشل الإرسال، أرسل الملف الأصلي
};

// تعريف الأوامر التي يمكن استخدامها لاستدعاء هذه الوحدة
handler.help = ['حول إلى صوتي (رد)'];
handler.tags = ['الصوت'];
handler.command = /^(صوتي|ملاحظة_صوتية|vn|ptt)?$/i;
export default handler;
