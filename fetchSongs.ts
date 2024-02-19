import chalk, { ChalkInstance } from "chalk";
import { existsSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const error: ChalkInstance = chalk.red;
const warn: ChalkInstance = chalk.yellow;
const bold: ChalkInstance = chalk.bold;
const header: ChalkInstance = chalk.magentaBright;
const ok: ChalkInstance = chalk.green;
const okBlue: ChalkInstance = chalk.blue;

export interface song {
    id: string,
    name: string,
    artist: string,
}

export async function readSongs(): Promise<song[]> {
    console.log(bold(header("Reading Songs from songs.txt...\n")));
    let songs: string[] = [];
    const songsFile = join(import.meta.dir, 'songs.txt');
    const songsFileExists = existsSync(songsFile);
    if (!songsFileExists) {
        console.error("Songs.txt does not exist!");
        process.exit(1);
    }
    const songsFileContents = Bun.file("songs.txt");
    songs = (await songsFileContents.text()).split("\n");
    let songObj: song[] = [];
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].startsWith("//") || songs[i].trim() == "") {
            continue;
        }
        let songName: string = songs[i].trim().split(" - ")[1];
        let artistName: string = songs[i].trim().split(" - ")[0];
        let searchRes = await axios.get('https://api.deezer.com/search?order=RANKING&q=' + encodeURIComponent(songs[i]));

        if (searchRes.data.data.length == 0 || searchRes.data.data == undefined) {
            console.log(warn(`WARNING: ${songName} by ${artistName} not found!`));
            continue;
        }

        songObj.push({ id: searchRes.data.data[0].id, name: songName, artist: artistName });

        console.log(ok(`Found: ${songName} `) + okBlue(`(ID: ${searchRes.data.data[0].id})`));
    }

    Bun.write(join(import.meta.dir, ".cacheFile.json"), JSON.stringify(songObj));
    return songObj;
}