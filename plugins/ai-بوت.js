*[ ! ] PLUGINS AI* 

import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw "Input Teks"
    await m.reply(wait)
    try {    
        let res = await (await fetch(`https://api-zenith.koyeb.app/api/other/openai-chat?text=${encodeURIComponent(text)}&apikey=zenkey`)).json()
        if (res.status && res.result) {
            await m.reply(res.result)
        } else {
            throw "`مرحبا كيف يمكنني مساعدتك اليوم`"
        }
    } catch (e) {
        throw e
    }
}

handler.help = ["ai"]
handler.tags = ["ai"]
handler.command = /^(بوت)$/i

export default handler
