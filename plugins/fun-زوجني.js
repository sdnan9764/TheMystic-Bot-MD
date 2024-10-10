 import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]

let couples = {}

async function loading(conn, m, response) {
    var hawemod = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
        "《 ████▒▒▒▒▒▒▒▒》30%",
        "《 ███████▒▒▒▒▒》50%",
        "《 ██████████▒▒》80%",
        "《 ████████████》100%"
    ]
    let { key } = await conn.sendMessage(m.chat, { text: "جاري تحقيق احلامك...", mentions: conn.parseMention(response) }, { quoted: m })
    for (let i = 0; i < hawemod.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await conn.sendMessage(m.chat, { text: hawemod[i], edit: key, mentions: conn.parseMention(response) }, { quoted: m });
    }
    await conn.sendMessage(m.chat, { text: response, edit: key, mentions: conn.parseMention(response) }, { quoted: m });
}

function handler(m, { groupMetadata, command, conn, text, usedPrefix}) {
  if (command === 'زوجني') {
    let ps = groupMetadata.participants.map(v => v.id)
    let a = pickRandom(ps)
    let k = Math.floor(Math.random() * 70)
    let top = `*${user(a)} هذه هي زوجتك* 💍`.trim()
    couples[m.sender] = a
    loading(conn, m, top)
  } else if (command === 'طلقني') {
    if (couples[m.sender]) {
      let ex = couples[m.sender]
      let top = `*${user(m.sender)} تم طلاقك من ${user(ex)}* 💔`.trim()
      delete couples[m.sender]
      loading(conn, m, top)
    } else {
      conn.reply(m.chat, 'أنت لست متزوجًا حتى تستطيع الطلاق.', m)
    }
  }
}

handler.help = handler.command = ['زوجني', 'طلقني']
handler.tags = ['المجال']
handler.group = true
handler.limit = 0

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
