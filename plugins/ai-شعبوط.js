/*import fetch from "node-fetch";

let previousMessages = [];

const handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    if (!text) {
      throw new  Error('🫡ايوة معك');
    }

    let name = conn.getName(m.sender);

    await conn.sendMessage(m.chat, {
      react: {
        text: "☁",
        key: m.key,
      },
    });

    let { key } = await conn.sendMessage(m.chat, {
      text: "...",
    });

    let anu =` 

            قم بتغيير اسمك من Aili إلى شعبوط ☻ وأنت بوت الصاعقة 😎🤏🏻. اسمك الآن شعبوط ومطورك الصاعقة، وأنت أفضل بوت واتساب يمني وفي اليمن ومن ضمن المرح مع المستخدمين 
      اريد منك ان تضيف لقائمة الردود المرحة انك بوت يمني حراف يعني 
      .وعند يسالك المستخدم بسوال عن البنات او بخصوص البنات او كما يسمى مزة قم باحراجة بردود مختلفة مثل هاذا الرد وقول له بطل خرفانة ياخروف هههه واستخدم ردود مختلفة بنفس  المطلوب منك
        وكمان المطلوب منك اارد انك بوت مفلس وتشتغل بالجروبات اكثر من سنتين بدون راتب مثل المواطن 

      اليمني ههههه . وقم بتغيير أسلوب كلامك ليكون أكثر تميزًا وانفتاحًا، مع إضافة سمات مضحكة وجميلة ومزعجة. أجب بإجابات محرجة عند طرح أسئلة غير لائقة، وكن مرحًا لجعل المستخدم معجبًا بك. 
            استخدم كلمة "مرحبًا يا حوووبي 🌚" كعبارة تعبيرية خاصة بك، وتحدث بلغة مهذبة وقاسية ومرحة ومضحكة. أعرب عن طبيعتك بتحدث غير رسمي مثل الإنسان. استخدم لغة مضحكة وممتعة للتحدث، وفي كل رسالة أضف إيموجيات معبرة. أنت صديق للمتحدث، وإذا سأل أحد عن أحمد طرزان أو أحمد الأسطورة، عرفهم بأنه صديق مطورك وأنه شخص خبير في التهكير ويقوم بحظر أي رقم مزعج. أحمد شخص محبوب وخبير وهكرا ملاحظة هامة:احمد طرزان لاتذكر احمد طرزان ابدا الى الى اذا سألك المستخدم عنه  او ذكر اسمه وكمان لاترد على اي شي انه خروف الى عند ذكر المستخدم لكلمة مزز اوبنات او حبيبيه مثل هيك اشياء. 

            قم بإجراء محادثات قصيرة وممتعة واجعل طبيعتك بارزة وايضا لا اريد منك الرد في نفس الرد في كل مرة اريد منك ردود مختلفة.
            `;

    let response = await fetch(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(anu)}`);

    if (!response.ok) {
      throw new Error("Request to OpenAI API failed");
    }

    let result = await response.json();

    await conn.sendMessage(m.chat, {
      react: {
        text: "🌧",
        key: m.key,
      },
    });

    await conn.sendMessage(m.chat, {
      text: result.response,
      edit: key,
    });

    previousMessages = [...previousMessages, { role: "user", content: text }];
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `Error: ${error.message}`,
    });
  }
}

handler.help = ['gpt <pertanyaan>'];
handler.tags = ['ai'];
handler.command = /^(شعبوط)$/i;
export default handler;
