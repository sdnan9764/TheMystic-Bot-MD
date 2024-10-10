let handler = async function (m, { text }) {

  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  let tradutor;
  if(idioma === 'ar') {
    tradutor = {
      bk9LText_T: "الرجاء إدخال رابط لاختصاره.",
      bk9LTaked_T: "تم بالفعل اختصار الرابط المقدم.",
      bk9err: "حدث خطأ ما، الرجاء المحاولة مرة أخرى لاحقًا."
    };
  } else {
    // تعريف ترجمات للغات الأخرى هنا
  }

  try {
    if (!text) {
      m.reply(`${tradutor.bk9LText_T}`);
      return;
    }
    const [link, alias] = text.split("+").map(part => part.trim());
    let apiUrl = `https://bk9.site/api/create?url=${encodeURIComponent(link)}`;
    if (alias) apiUrl += `&alias=${encodeURIComponent(alias)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.BK99) {
      return m.reply(`${tradutor.bk9LTaked_T}`);
    }
    const shortURL = data.BK9;
    return m.reply(`${shortURL}`);
  } catch (error) {
    console.error(error);
    return m.reply(`${tradutor.bk9err}`);
  }
};

handler.command = ['قص'];
handler.tags = ['tools'];
export default handler;
