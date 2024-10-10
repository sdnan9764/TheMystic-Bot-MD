 let toM = a => '@' + a.split('@')[0]

async function loading(conn, m, response) {
    var hawemod = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
        "《 ████▒▒▒▒▒▒▒▒》30%",
        "《 ███████▒▒▒▒▒》50%",
        "《 ██████████▒▒》80%",
        "《 ████████████》100%"
    ]
    let { key } = await conn.sendMessage(m.chat, { text: "جاري الزواج...", mentions: conn.parseMention(response) }, { quoted: m })
    for (let i = 0; i < hawemod.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await conn.sendMessage(m.chat, { text: hawemod[i], edit: key, mentions: conn.parseMention(response) }, { quoted: m });
    }
    await conn.sendMessage(m.chat, { text: response, edit: key, mentions: conn.parseMention(response) }, { quoted: m });
}

async function handler(m, { groupMetadata, conn }) {
    let ps = groupMetadata.participants.map(v => v.id)
    let a = m.sender
    let b
    do b = ps.getRandom()
    while (b === a)
    const response = `${toM(a)} ❤️ ${toM(b)}\n*أفــضل زوجــين عــلى الــأطـلاق 🥹💖🍻*`;
    await loading(conn, m, response);
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['زواج']

handler.group = true

export default handler
