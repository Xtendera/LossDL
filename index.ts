import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk, { ChalkInstance } from 'chalk';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import extract from 'extract-zip';

const error: ChalkInstance = chalk.red;
const warn: ChalkInstance = chalk.yellow;
const bold: ChalkInstance = chalk.bold;
const pass: ChalkInstance = chalk.green;

console.log(bold(pass("LossDL\n\n")));


const outputDir = join(import.meta.dir, 'out');
if (!existsSync(outputDir)) {
  console.log(warn("WARNING: Output directory does not exist, creating it now..."));
  mkdirSync(outputDir);
}

// If the buster/ directory does not exist, download the buster zip from https://github.com/dessant/buster/releases/download/v2.0.1/buster_captcha_solver_for_humans-2.0.1-chrome.zip and extract it to the buster/ directory.
const busterDir = join(import.meta.dir, 'buster');
// Automatically download buster if it does not exist
if (!existsSync(busterDir)) {

  console.log(warn("WARNING: Buster directory does not exist, downloading it now..."));
  const busterZip = join(import.meta.dir, 'buster.zip');
  const busterURL = 'https://github.com/dessant/buster/releases/download/v2.0.1/buster_captcha_solver_for_humans-2.0.1-chrome.zip';
  const writeStream = createWriteStream(busterZip);
  const response = await fetch(busterURL);
  if (response.body) {
    const readableStream = Readable.from(response.body);
    readableStream.pipe(writeStream);
    await new Promise((resolve) => {
      writeStream.on('finish', resolve);
    });
  }
  await extract(busterZip, { dir: busterDir });
}

// puppeteer.use(StealthPlugin());
// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false
//   });
//   const page = await browser.newPage();
//   await page.setRequestInterception(true);
//   page.on('request', (req): void => {
//     if (req.isInterceptResolutionHandled()) return;
//     if (req.url().includes('free-mp3-download.net')) {
//       req.respond({
//         status: 200,
//         contentType: 'text/html',
//         body: '<h1>You just got hacked!</h1>',
//       })
//       return;
//     }
//     req.abort();
//   });
// })();

