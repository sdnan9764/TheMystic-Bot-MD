import {unlinkSync, readFileSync} from 'fs';
import {join} from 'path';
import {exec} from 'child_process';

const handler = async (m, {conn, args, __dirname, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/ar.json`));
  const tradutor = _translate.plugins.audio_efectos;

  try {
    const q = m.quoted ? m.quoted : m;
    const mime = ((m.quoted ? m.quoted : m.msg).mimetype || '');
    let set;
    if (/باس|bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30';
    if (/مفجّر|blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
    if (/عميق|deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
    if (/إريب|earrape/.test(command)) set = '-af volume=12';
    if (/سريع|سريعة|fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
    if (/سمين|fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
    if (/نايتكور|nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
    if (/عكس|reverse/.test(command)) set = '-filter_complex "areverse"';
    if (/روبوت|robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
    if (/بطئ|slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
    if (/ناعم|smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
    if (/توباي|سنجاب|chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
    if (/صوت|audio/.test(mime)) {
      const ran = getRandom('.mp3');
      const filename = join(__dirname, '../tmp/' + ran);
      const media = await q.download(true);
      exec(`ffmpeg -i ${media} ${set} ${filename}`, async (err, stderr, stdout) => {
        await unlinkSync(media);
        if (err) throw `_*خطأ!*_`;
        const buff = await readFileSync(filename);
        conn.sendFile(m.chat, buff, ran, null, m, true, {
          type: 'audioMessage',
          ptt: true,
        });
      });
    } else throw `${tradutor.texto1} ${usedPrefix + command}*`;
  } catch (e) {
    throw e;
  }
};

handler.help = ['باس', 'مفجّر', 'عميق', 'إريب', 'سريع', 'سمين', 'نايتكور', 'عكس', 'روبوت', 'بطئ', 'ناعم', 'توباي', 'سنجاب'].map((v) => v + ' [vn]');
handler.tags = ['صوت'];
handler.command = /^(باس|مفجّر|عميق|إريب|سريع|سمين|نايتكور|عكس|روبوت|بطئ|ناعم|توباي|سنجاب)$/i;
export default handler;

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};