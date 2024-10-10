
  const calculateAge = (birthday) => {
  const [year, month, day] = birthday.split('-');
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getDaysUntilBirthday = (birthday) => {
  const [year, month, day] = birthday.split('-');
  const today = new Date();
  let nextBirthday = new Date(today.getFullYear(), month - 1, day);
  if (today > nextBirthday) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  return daysUntilBirthday;
};

const getZodiacSign = (day, month) => {
  const zodiacSigns = [
    "برج الجدي", "برج الدلو", "برج الحوت", "برج الحمل", "برج الثور", "برج الجوزاء",
    "برج السرطان", "برج الأسد", "برج العذراء", "برج الميزان", "برج العقرب", "برج القوس"
  ];
  const cutoffDays = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
  return day <= cutoffDays[month - 1] ? zodiacSigns[month - 1] : zodiacSigns[month % 12];
};

const handler = async (message, { conn, args, usedPrefix, command }) => {
  const birthday = args[0];
  if (!birthday) {
    throw "يرجى إدخال تاريخ الميلاد بتنسيق سنة-شهر-يوم مثل 1999-10-06";
  }

  const birthDateParts = birthday.split('-');
  if (birthDateParts.length !== 3 || isNaN(new Date(birthDateParts[0], birthDateParts[1] - 1, birthDateParts[2]).getTime())) {
    throw "تاريخ الميلاد غير صالح. يرجى إدخال تاريخ صالح بتنسيق سنة-شهر-يوم مثل 1999-10-06";
  }

  const age = calculateAge(birthday);
  const daysUntilBirthday = getDaysUntilBirthday(birthDateParts.join('-'));
  const birthDate = new Date(birthDateParts[0], birthDateParts[1] - 1, birthDateParts[2]);
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  const weekday = birthDate.toLocaleString('ar-EG', { weekday: 'long' });
  const zodiacSign = getZodiacSign(day, month);
  const today = new Date();

  const messageText = `
عمرك الآن: ${age} سنوات / ${today.getMonth() - birthDate.getMonth()} شهور / ${today.getDate() - birthDate.getDate()} أيام
🔮 ولدت في يوم: ${weekday}
🔮 برجك الفلكي: ${zodiacSign}
🎉 المرحلة العمرية: بالغ
🎂 متبقي على عيد ميلادك: ${daysUntilBirthday} يوم / ${daysUntilBirthday * 24} ساعة / ${daysUntilBirthday * 1440} دقيقة / ${daysUntilBirthday * 86400} ثانية
  `;

  await conn.sendMessage(message.chat, {
    text: messageText
  });
};

handler.help = ["عمري"];
handler.tags = ["age"];
handler.command = /^(age|عمري)$/i;
handler.limit = false;

export default handler;

