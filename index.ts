import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk, { ChalkInstance } from 'chalk';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const error: ChalkInstance = chalk.red;
const warn: ChalkInstance = chalk.yellow;
const bold: ChalkInstance = chalk.bold;
const pass: ChalkInstance = chalk.green;

console.log(bold(pass("LossDL\n\n")));

// check if the output directory exists, and if not create it
const outputDir = join(import.meta.dir, 'out');
if (!existsSync(outputDir)) {
  console.log(warn("WARNING: Output directory does not exist, creating it now..."));
  mkdirSync(outputDir);
}

puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req): void => {
    if (req.isInterceptResolutionHandled()) return;
    if (req.url().includes('free-mp3-download.net')) {
      req.respond({
        status: 200,
        contentType: 'text/html',
        body: '<h1>You just got hacked!</h1>',
      })
      return;
    }
    req.abort();
  });
})();

