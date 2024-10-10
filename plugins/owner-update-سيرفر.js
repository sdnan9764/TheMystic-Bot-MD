// استيراد قاعدة البيانات من المسار '../lib/database.js'
import db from '../lib/database.js'

// استيراد execSync من الحزمة 'child_process'
import { execSync } from 'child_process'

// تعريف دالة التعامل مع الرسائل
let handler = async (m, { conn, text }) => {
    // التحقق مما إذا كان معرف المستخدم هو نفس معرف المستخدم المتصل بالسيرفر
    if (conn.user.jid == conn.user.jid) {
        // تنفيذ أمر 'git pull' لجلب التحديثات الأخيرة
        let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
        // إرسال النتيجة كرد إلى المستخدم
        conn.reply(m.chat, stdout.toString(), m)
    }
}

// تعريف المساعدة للأمر 'update'
handler.help = ['update']

// تعريف الوسوم المتعلقة بالمالك
handler.tags = ['owner']

// تعريف الأوامر المرتبطة بالتحديث
handler.command = ['سيرفر', 'actualizar', 'fix', 'fixed']

// تحديد أن هذا الأمر خاص بالمالك فقط
handler.rowner = true

// تصدير الدالة handler لتكون متاحة للاستخدام في مكان آخر
export default handler