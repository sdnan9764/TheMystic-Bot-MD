const handler = async (m, { conn, args, usedPrefix, command }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.gc_config

  const isClose = {
    'فتح': 'not_announcement',
    'إغلاق': 'announcement',
    'مفتوح': 'not_announcement',
    'مغلق': 'announcement',
    'افتح': 'not_announcement',
    'أغلق': 'announcement',
  }[(args[0] || '')];
  
  if (isClose === undefined) {
    throw `
${tradutor.texto1[0]}

${tradutor.texto1[1]}
*┠┉↯ ${usedPrefix + command} افتح*
*┠┉↯ ${usedPrefix + command} أغلق*
`.trim();
  }
  
  await conn.groupSettingUpdate(m.chat, isClose);
  {m.reply(`${tradutor.texto1[0]}`);}
};

handler.help = ['مجموعة فتح / إغلاق', 'grupo abrir / cerrar'];
handler.tags = ['مجموعة'];
handler.command = /^(تحقق|grupo)$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;
