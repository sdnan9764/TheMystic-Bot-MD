

import fetch from "node-fetch";
import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";
import Jimp from "jimp";
const handler = async (m, {
  command,
  usedPrefix,
  conn,
  args
}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q)?.mimetype || "";
  if (!mime) return m.reply("*Tidak ada media yang ditemukan*");
  try {
    m.reply(wait);
    const media = await q.download();
    const data = await postImageToPrompt(media);

    m.reply(data || "*Tidak ada data dari API*");
  } catch (e) {
    console.error("Error:", e);
    
  }
};
async function postImageToPrompt(imageBuffer) {
  try {
    const fileType = await fileTypeFromBuffer(imageBuffer);
    const ext = fileType?.ext || "jpg";
    const mimeType = fileType?.mime || "image/jpeg";
    const image = await Jimp.read(imageBuffer);
    image.cover(1024, 1024);
    const resizedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    const blob = new Blob([resizedBuffer], {
      type: mimeType
    });
    const formData = new FormData();
    formData.append("image", blob, `image.${ext}`);
    const response = await fetch("https://www.videotok.app/api/free-image-to-prompt", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        Referer: "https://www.videotok.app/image-to-prompt"
      },
      body: formData
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const output = await response.json();
    return output?.choices?.[0]?.message?.content;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}
handler.help = ["prompt"];
handler.tags = ["ai"];
handler.command = /^(prompt|تحليل)$/i;
export default handler;