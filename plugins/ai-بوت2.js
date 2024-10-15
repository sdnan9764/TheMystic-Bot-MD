
import axios from "axios"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.length >= 1 ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null
  if (!text) return await m.reply("Masukkan teks")

  try {
    const response = await gpt4(text)
    await m.reply(response.response)
  } catch (e) {
    await m.reply("Terjadi kesalahan: " + e.message)
  }
}

handler.help = ["ai"]
handler.tags = ["ai"]
handler.command = /^(بوت2)$/i

export default handler
/**
 * Scraped By Kaviaann
 * Protected By MIT LICENSE
 * Whoever caught removing wm will be sued
 * @description Any Request? Contact me : vielynian@gmail.com
 * @author Kaviaann 2024
 * @copyright https://whatsapp.com/channel/0029Vac0YNgAjPXNKPXCvE2e
 */
async function gpt4(prompt) {
  try {
    const token = Math.random().toString(32).substring(2)
    const d = process.hrtime()

    // REGISTER PROMPT
    await axios.post("https://thobuiq-gpt-4o.hf.space/run/predict?__theme=light", {
      data: [{ text: prompt, files: [] }],
      event_data: null,
      fn_index: 3,
      session_hash: token,
      trigger_id: 18,
    }, {
      headers: {
        Origin: "https://thobuiq-gpt-4o.hf.space",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    })

    // JOIN
    await axios.post("https://thobuiq-gpt-4o.hf.space/queue/join?__theme=light", {
      data: [null, null, "idefics2-8b-chatty", "Greedy", 0.7, 4096, 1, 0.9],
      event_data: null,
      fn_index: 5,
      session_hash: token,
      trigger_id: 18,
    }, {
      headers: {
        Origin: "https://thobuiq-gpt-4o.hf.space",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    })

    // HANDLE RESULT
    const stream = await axios.get("https://thobuiq-gpt-4o.hf.space/queue/data?" +
      new URLSearchParams({
        session_hash: token,
      }), {
      headers: {
        Accept: "text/event-stream",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
      responseType: "stream",
    })

    return new Promise((resolve, reject) => {
      stream.data.on("data", (chunk) => {
        const data = JSON.parse(chunk.toString().split("data: ")[1])
        if (data.msg === "process_completed") {
          const stop = process.hrtime(d)
          const r = data.output.data[0][0][1] || ""
          if (!r) return reject(new Error("Fail to get response"))
          resolve({
            prompt,
            response: r,
            duration: stop[0] + " s",
          })
        }
      })
    })
  } catch (e) {
    throw e
  }
}
