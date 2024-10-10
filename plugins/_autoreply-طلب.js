export async function all(m) {

  // عندما يرسل أحدهم رابط مجموعة إلى البوت
  if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('https://chat') || m.text.startsWith('open this link')) && !m.isBaileys && !m.isGroup) {
    
    // رسالة تخبر المستخدم بالانتظار حتى يعطي المطور البوت الصلاحية للانضمام
    this.sendMessage(m.chat, {
      text: `لقد استلمت رابط المجموعة. يرجى الانتظار حتى يقوم المطور بإعطاء البوت الصلاحية للانضمام. إذا كنت بحاجة إلى مساعدة، اكتب *.المطور* للتواصل مع المطور.`.trim()
    }, { quoted: m });

    // إضافة رد فعل على الرسالة
    m.react('⏳');  // أيقونة الساعة الرملية لتمثيل الانتظار
  } 

  return !0;
}
