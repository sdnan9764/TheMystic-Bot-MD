import os from "os";

import {

  sizeFormatter

} from "human-readable";

const format = sizeFormatter({

    std: "JEDEC",

    decimalPlaces: 2,

    keepTrailingZeroes: !1,

    standard: "KMGTPEZY"

  }),

  handler = async (m, {

    conn

  }) => {

    try {

      const start = Date.now();

      await new Promise(resolve => setTimeout(resolve, 1e3));

      const responseTime = (Date.now() - start) / 1e3,

        osInfo = `🖥️ *OS*: ${os.type()} ${os.release()}\n💻 *CPU*: ${os.cpus()[0]?.model}\n🧠 *Memory*: ${format(os.totalmem())}`,

        responseMessage = `⏰ *Response Time*: ${responseTime.toFixed(2)}s\n\n${osInfo}`;

      await conn.reply(m.chat, responseMessage, m, {

        contextInfo: {

          mentionedJid: [m.sender],

          externalAdReply: {

            title: "🤖 Bot is active",

            body: "",

            mediaType: 1,

            previewType: 0,

            renderLargerThumbnail: false,

            thumbnailUrl: "https://cdn-icons-png.flaticon.com/128/1533/1533913.png",

            sourceUrl: ""

          }

        }

      });

    } catch (error) {

      console.error("Error in handler:", error);

    }

  };

handler.help = ["tes"]

handler.command = ["tes"]

export default handler;