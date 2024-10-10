async function handler(m, { command }) {
    command = command.toLowerCase()
    this.anonymous = this.anonymous ? this.anonymous : {}
    switch (command) {
        case 'التالي':
        case 'مغادرة': {
            let room = Object.values(this.anonymous).find(room => room.check(m.sender))
            if (!room) return this.sendButton(m.chat, '_أنت لست في محادثة مجهولة_', 'بوت الصاعقة😎🤏🏻', null, [['البحث عن شريك', `.بدء`]], m)
            m.reply('حسنًا')
            let other = room.other(m.sender)
            if (other) await this.sendButton(other, '_الشريك غادر المحادثة_', 'بوت الصاعقة😎🤏🏻', null, [['البحث عن شريك', `.بدء`]], m)
            delete this.anonymous[room.id]
            if (command === 'مغادرة') break
        }
        case 'بدء': {
            if (Object.values(this.anonymous).find(room => room.check(m.sender))) return this.sendButton(m.chat, '_أنت لا تزال في محادثة مجهولة، في انتظار شريك_', 'بوت الصاعقة😎🤏🏻', null, [['الخروج', `.مغادرة`]], m)
            let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
            if (room) {
                await this.sendButton(room.a, '_تم العثور على شريك!_', 'بوت الصاعقة😎🤏🏻', null, [['التالي', `.التالي`]], m)
                room.b = m.sender
                room.state = 'CHATTING'
                await this.sendButton(room.a, '_تم العثور على شريك!_', 'بوت الصاعقة😎🤏🏻', null, [['التالي', `.التالي`]], m)
            } else {
                let id = + new Date
                this.anonymous[id] = {
                    id,
                    a: m.sender,
                    b: '',
                    state: 'WAITING',
                    check: function (who = '') {
                        return [this.a, this.b].includes(who)
                    },
                    other: function (who = '') {
                        return who === this.a ? this.b : who === this.b ? this.a : ''
                    },
                }
                await this.sendButton(m.chat, '_انتظار شريك..._', 'بوت الصاعقة😎🤏🏻', null, [['الخروج', `.مغادرة`]], m)
            }
            break
        }
    }
}
handler.help = ['بدء', 'مغادرة', 'التالي']
handler.tags = ['مجهول']
handler.command = ['بدء', 'مغادرة', 'التالي']

handler.private = true
handler.group = true

export default handler
