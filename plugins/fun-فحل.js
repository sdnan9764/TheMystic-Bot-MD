import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, command, conn, text, usedPrefix}) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let k = Math.floor(Math.random() * 70);
let top = `*${user(a)} انت فحل ونايك كسمه المجال ياروحي كسمه من من يوقف بطريقك او يجي يسوي نفسه فحل عندك 🏌🏻‍♂️🚸.*`.trim()
conn.sendFile(m.reply(top, null, { mentions: [a]}))
}

handler.help = handler.command = ['فحل']
handler.tags = ['المجال']
handler.group = true
handler.limit = 0

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}