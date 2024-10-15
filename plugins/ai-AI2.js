import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.eulaAI = conn.eulaAI ? conn.eulaAI : {};
    if (!text) throw '🚩 اكتب "شعبوط2 تفعيل" لبدء الدردشة أو "شعبوط2 إيقاف" لإيقاف الدردشة';
    
    if (text === 'تفعيل') {
        conn.eulaAI[m.sender] = { sessionChat: [] };
        m.reply('✅ تم تفعيل جلسة الدردشة بنجاح!');
    } else if (text === 'إيقاف') {
        delete conn.eulaAI[m.sender];
        m.reply('🛑 تم إيقاف جلسة الدردشة بنجاح!');
    }
};

handler.before = async (m, { conn }) => {
    conn.eulaAI = conn.eulaAI ? conn.eulaAI : {};
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;
    if (!conn.eulaAI[m.sender]) return;
    if (['.', '#', '!', '/', '\\'].some(prefix => m.text.startsWith(prefix))) return;

    if (conn.eulaAI[m.sender] && m.text) {
        const messages = conn.eulaAI[m.sender].sessionChat || [];
        let userName = conn.getName(m.sender);

        try {
            const sendRequest = async function(input) {
                return new Promise(async (resolve, reject) => {
                    const apiUrl = 'https://www.blackbox.ai/api/chat';
                    const headers = {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; 2201116SG Build/RKQ1.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.20 Mobile Safari/537.36',
                        'Referer': 'https://www.blackbox.ai/agent/EULAHmbaZiS'
                    };
                    const requestBody = {
                        messages: [{ id: m.sender, content: input, role: 'user' }],
                        id: m.sender,
                        previewToken: null,
                        userId: null,
                        codeModelMode: true,
                        agentMode: { mode: true, id: 'EULAHmbaZiS', name: 'EULA' },
                        trendingAgentMode: {},
                        isMicMode: false,
                        maxTokens: 1024,
                        isChromeExt: false,
                        githubToken: null,
                        clickedAnswer2: false,
                        clickedAnswer3: false,
                        clickedForceWebSearch: false,
                        visitFromDelta: false,
                        mobileClient: false
                    };

                    try {
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(requestBody),
                            compress: true
                        });
                        let responseText = await response.text();
                        responseText = responseText.replace(/^\$@\$.+?\$@\$/, '');
                        resolve(responseText);
                    } catch (error) {
                        reject('Error:', error);
                    }
                });
            };

            let aiResponse = await sendRequest(m.text);
            if (aiResponse) {
                await m.reply(aiResponse);
                conn.eulaAI[m.sender].sessionChat = messages.map(msg => msg.content);
            } else {
                m.reply('حدث خطأ أثناء استرجاع الرد.');
            }
        } catch (error) {
            throw error;
        }
    }
};

handler.command = ['شعبوط2'];
handler.tags = ['ai'];
handler.help = ['شعبوط2 تفعيل', 'شعبوط2 إيقاف'];
handler.register = true;

export default handler;
