import Presence from '@whiskeysockets/baileys'
let handler  = async (m, { conn, args, text }) => {
if (!text) throw `*مثال : .تغير-الاسم اكتب اسم الجروب الجديد*`
try {
let text = args.join` `
if(!args || !args[0]) {
} else {
conn.groupUpdateSubject(m.chat, text)}
} catch (e) {
throw '*مثال : .تغير الاسم الجروب*'
}}
handler.help = ['setname <text>']
handler.tags = ['group']
handler.command = /^(تغير-الاسم|تغيرالاسم)$/i
handler.group = true
handler.admin = true
export default handler
