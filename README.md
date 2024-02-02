# LossDL

_Script to download lossless music automatically._

## Info

So this is basically an improved version of another script I had written in Python/Selenium to do the same thing. My Python version downloaded songs by instructing a browser to go to the free-mp3-download.net download page and clicking "download". This version is written in Bun/Typescript and downloads songs by calling the API instead, which is faster.

# System Requirements

- A relatively modern 64-bit CPU
- A stable and fast internet connection
- At least 6 GB RAM
- 500MB+ of storage (depending on the length of the songs list)
- Any distro of Linux or MacOS, Windows 10/11 64-bit

# Installation

Get a list of your requested songs. Put them in the format shown in the songs.txt file, without the "//" part of it.

Must have [Bun](https://bun.sh/), [Git](https://git-scm.com/), and [ViolentMonkey](https://violentmonkey.github.io/) installed on your browser. Click [this link](https://github.com/Xtendera/LossDL/raw/main/lossdl-captcha.user.js) to install the userscript to your browser, after installing ViolentMonkey. 

Run the following command in your terminal to download the source code for this project and enter the project directory:
```shell
git clone https://github.com/Xtendera/LossDL
cd LossDL
```

Install all the dependancies:
```shell
bun install
```

# Usage

```
bun run index.ts [ARGS]
```

`--useCache (-c)` Uses cachefile instead of songs.txt. Use this if the program crashed or got stopped, it can resume from where it began (considering it was already to download stage). Default: **FALSE**.


`--quality (-q)` Specify download quality. Valid qualities are: *mp3-128, mp3-320,* and *flac*. *mp3-128* is 128 Kbps, *mp3-320* is 320 Kbps, and *flac* is flac (lossless) quality. Default: *mp3-320*.

**WARNING**: This project is provided for educational purposes only. Piracy is illegal and unethical.
