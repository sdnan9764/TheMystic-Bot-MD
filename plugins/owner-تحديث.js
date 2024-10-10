import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from'fs';
import path from'path';
import axios from'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const owner = 'altmsahjlyl91';
const repo = 'now-v2';
let handler = async (m, { text, usedPrefix, command }) => {

if (!text) {
try {
   const folders = ['plugins', 'lib', 'tmp']; 
// مجلدات لي غادين يتحدثو بالامر ديريكت

   function generateRandomIP() {
     return Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256);
   }

   function fetchAndSaveFiles(folder) {
     const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folder}`;
     const rootPath = path.join(__dirname, '..', folder);

     axios.get(githubApiUrl, {
       headers: {
         'X-Forwarded-For': generateRandomIP()
       }
     })
       .then(response => {
         const files = response.data;

         if (Array.isArray(files)) {
           if (!fs.existsSync(rootPath)) {
             fs.mkdirSync(rootPath, { recursive: true });
             console.log(`Folder created: ${folder}`);

           }

           files.forEach(file => {
             if (file.type === 'file' && file.name !== 'update.js') {
               const filePath = path.join(rootPath, file.name);

               axios.get(file.download_url, { responseType: 'arraybuffer', headers: { 'X-Forwarded-For': generateRandomIP() } })
                 .then(response => {
                   fs.writeFile(filePath, response.data, err => {
                     if (err) throw err;
                     console.log(`File saved: ${file.name}`);


                   });
                 })
                 .catch(err => {
                   console.error(`Error downloading file: ${file.name}`, err);
                 });
             }
           });
         } else {
           console.log(`The folder '${folder}' does not exist in the repository.`);

         }
       })
       .catch(err => {
         if (err.response && err.response.status === 404) {
           console.log(`The folder '${folder}' does not exist in the repository.`);
         } else {
           console.error(`Error fetching from GitHub API for folder ${folder}`, err);
 m.reply(`*اعد المحاولة بعد دقيقة* !!`);
         }
       });
   }

   folders.forEach(folder => {
     fetchAndSaveFiles(folder);
   });
   m.reply(`*تم تحديث روبوتك*🥳`);
} catch (error) {
    m.reply('An error occurred while updating. Ensure your bot is in a Git repository.');
}
} else {
 try {
   const files = [text];
   function generateRandomIP() {
     return Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256) + '.' +
       Math.floor(Math.random() * 256);
   }

   function fetchAndSaveFile(filePath) {
     const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
     const localFilePath = path.join(__dirname, '..', filePath);

     axios.get(githubApiUrl, {
       headers: {
         'X-Forwarded-For': generateRandomIP()
       }
     })
       .then(response => {
         const data = response.data;

         if (data.type === 'file' && filePath !== 'plugins/update.js') {
           axios.get(data.download_url, { responseType: 'arraybuffer', headers: { 'X-Forwarded-For': generateRandomIP() } })
             .then(response => {
               fs.writeFile(localFilePath, response.data, err => {
                 if (err) throw err;
                 console.log(`File saved: ${filePath}`);
m.reply(`*تم تحديث روبوتك* 🥳`);
               });
             })
             .catch(err => {
               console.error(`Error downloading file: ${filePath}`, err);
             });
         } else {
           console.log(`The file '${filePath}' does not exist or is not of type 'file'.`);

m.reply(`*الملف ${filePath} غير موجود*!!`);
         }
       })
       .catch(err => {
         if (err.response && err.response.status === 404) {
           console.log(`The file '${filePath}' does not exist in the repository.`);

  m.reply(`*الملف ${filePath} غير موجود*!!`);
         } else {
           console.error(`Error fetching from GitHub API for file ${filePath}`, err);
 m.reply(`*انتظر دقيقة ثم اعد المحاولة* ❤️`);
         }
       });
   }

   files.forEach(file => {
     fetchAndSaveFile(file);
   });
   } catch (error) {
    m.reply('An error occurred while updating. Ensure your bot is in a Git repository.');
}
};
};     

handler.help = ['update'];
handler.tags = ['system'];
handler.command = ['تحديث'];
handler.owner = true;

export default handler;
