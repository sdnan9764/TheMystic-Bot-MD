import fetch from 'node-fetch' // استيراد مكتبة لجلب البيانات عبر الإنترنت

// وظيفة للتعامل مع الأوامر
let handler = async (m, { usedPrefix, command, args }) => {
    // التحقق إذا لم يتم إدخال اسم كتاب الحديث
    if (!args[0]) {
        // جلب قائمة الكتب المتاحة من API
        let pilihanRes = await fetch(`https://allhadist.vercel.app/hadith`)
        let pilihan = await pilihanRes.json()

        // تنسيق قائمة الكتب لعرضها للمستخدم كما يتم جلبها من الـ API
        let pilihanText = pilihan.map(p => `${p.name}\n1 - ${p.total}`).join('\n\n')

        // إرسال رسالة للمستخدم تحتوي على تعليمات وأسماء الكتب
        throw `مثال:\n${usedPrefix + command} Bukhari 1\n\nالكتب المتاحة:\n${pilihanText}`
    }

    // التحقق إذا لم يتم إدخال رقم الحديث
    if (!args[1]) throw `ما هو رقم الحديث؟\nمثال: ${usedPrefix + command} ${args[0]} 1`

    try {
        // جلب قائمة الكتب مرة أخرى من API للتحقق من اسم الكتاب
        let pilihanRes = await fetch(`https://allhadist.vercel.app/hadith`)
        let pilihan = await pilihanRes.json()

        // البحث عن الكتاب المُدخل من قبل المستخدم كما هو موجود في API
        let hadistSlug = pilihan.find(p => p.name.toLowerCase() === args[0].toLowerCase())?.slug

        // إذا كان اسم الكتاب غير صحيح
        if (!hadistSlug) throw `اسم الكتاب غير صحيح. الكتب المتاحة:\n${pilihan.map(p => p.name).join(', ')}`

        // جلب الحديث من API بناءً على الكتاب ورقم الحديث
        let res = await fetch(`https://allhadist.vercel.app/hadith/${hadistSlug}/${args[1]}`)
        let json = await res.json()

        // استخراج التفاصيل مثل رقم الحديث، النص العربي، والترجمة
        let { number, arab, id } = json

        // إرسال الحديث للمستخدم
        await m.reply(`رقم الحديث: ${number}\n\nالنص العربي:\n${arab}\n\nالترجمة:\n${id}`)
    } catch (e) {
        // التعامل مع الأخطاء
        throw `حدث خطأ: ${e.message}`
    }
}

// تعريف المساعدة والتصنيفات الخاصة بالأمر
handler.help = ['hadist']
handler.tags = ['islamic']
handler.command = /^(hadist|احاديث?)$/i

// تصدير المعالج
export default handler