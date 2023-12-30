import chalk, { ChalkInstance } from 'chalk';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import jsdom from 'jsdom';
import https from 'https';
import { readSongs, song } from './fetchSongs';
import { BunFile } from 'bun';
import sanitize from 'sanitize-filename';

const error: ChalkInstance = chalk.red;
const warn: ChalkInstance = chalk.yellow;
const bold: ChalkInstance = chalk.bold;
const header: ChalkInstance = chalk.magentaBright;
const ok: ChalkInstance = chalk.green;
const okBlue: ChalkInstance = chalk.blue;

async function getDownloadURL(id: string, format: string, captcha: string, phpSessionID: string): Promise<string | undefined> {
  const dlLink = await axios.post('https://free-mp3-download.net/dl.php?', {
    i: id,
    f: format,
    h: captcha,
  }, {
    headers: {
      'Referer': 'https://free-mp3-download.net/download.php?id=2454947245',
      'Cookie': `PHPSESSID=${phpSessionID}`,
    }
  });
  if (dlLink.data == 'Incorrect captcha') {
    return undefined;
  }
  return dlLink.data;
}

console.log(bold(ok("LossDL\n\n")));
await Bun.sleep(1000);

const outputDir = join(import.meta.dir, 'out');
if (!existsSync(outputDir)) {
  console.log(warn("WARNING: Output directory does not exist, creating it now..."));
  mkdirSync(outputDir);
}
let songObj: song[] = [];
if (process.argv.length > 2 && process.argv[2] == '-c') {
  const cacheFileB: BunFile = Bun.file(join(import.meta.dir, '.cacheFile.json'));
  const cacheFileBContents = await cacheFileB.text(); 
  songObj = JSON.parse(cacheFileBContents);
} else {
  songObj = await readSongs()
}

console.log(header(bold("\nLocating session ID and RECAPTCHA token...\n")));

await Bun.sleep(1000);

// Could be any /download.php page.
const dlP = await axios.get('https://free-mp3-download.net/download.php?id=143783500', {
  headers: {
    'Referer': 'https://free-mp3-download.net/'
  }
});
if (dlP.status != 200) {
  console.error("Something went wrong, please check your internet connection!")
  process.exit(1);
}
const { JSDOM } = jsdom;
const dom = new JSDOM(dlP.data);
let captchaSitekey: string | null = dom.window.document.getElementsByClassName('g-recaptcha')[0].getAttribute('data-sitekey');
if (captchaSitekey == null) {
  console.log(warn("WARNING: Could not identify captcha sitekey. Using default key instead. It might be outdated!"));
  captchaSitekey = "6LfzIW4UAAAAAM_JBVmQuuOAw4QEA1MfXVZuiO2A";
}

if (dlP.headers['set-cookie'] == null) {
  console.error("Something went wrong!")
  process.exit(1);
}
let cookies: string[] = dlP.headers['set-cookie'][0].split(';');
let sessionID: string | null = null;
for (let i = 0; i < cookies.length; i++) {
  if (cookies[i].includes('PHPSESSID')) {
    sessionID = cookies[i].split('=')[1];
  }
}
if (sessionID == null) {
  console.log(warn("WARNING: Could not find session id, proceeding without it!"));
  sessionID = '';
}

console.log(header(bold('\nLoading CAPTCHA server...\n')));

await Bun.sleep(1000);

let currentCaptchaToken = '';
let currentDlID = '';

const captchaServer = Bun.serve({
  port: 8072,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname == '/api/olState') {
      return new Response("lossDL");
    } else if (url.pathname == '/api/siteKey') {
      return new Response(captchaSitekey);
    } else if (request.method == "POST" && url.pathname == '/api/token') {
      const token = await request.text();
      currentCaptchaToken = token;
    } else if (url.pathname == '/api/needToken') {
      if (currentCaptchaToken == '') {
        return new Response('true;' + currentDlID);
      }
        return new Response("false");
    }
    return new Response("The requested URL was not found on the server.");
  },
});

console.log(header(bold("\nCAPTCHA server is online, please proceed to https://free-mp3-download.net after installing the userscript.\n")));
await Bun.sleep(1000);
console.log(header(bold("\nStarting download...\n")));
await Bun.sleep(1000);

for (let i = 0; i < songObj.length; i++) {
  console.log(ok(`Downloading: ${songObj[i].name} `) + okBlue(`(ID: ${songObj[i].id})`));
  let dlLink = await getDownloadURL(songObj[i].id, 'flac', '', sessionID);
  if (dlLink == undefined) {
    currentCaptchaToken = '';
    currentDlID = songObj[i].id;
    while (currentCaptchaToken == '') {
      await Bun.sleep(500);
    }
    dlLink = await getDownloadURL(songObj[i].id, 'flac', currentCaptchaToken, sessionID);
    if (dlLink == undefined) {
      console.error("Something went wrong!!");
      process.exit(1);
    }
  }
  const filePath = join(import.meta.dir, `out/${sanitize(songObj[i].artist)} - ${sanitize(songObj[i].name)}.flac`);
  https.get(dlLink, (res) => {
    const fileStream = createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      return;
    });
    return;
  });
  }

console.log(header(bold('Done Downloading!')));

process.exit(0);