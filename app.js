import WebTorrent from "webtorrent";
import fs from "fs";
import path from "path";

const client = new WebTorrent();

// Function to download a torrent
function downloadTorrent(torrentId, outputPath = "./downloads") {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log(`Starting download: ${torrentId}`);

  client.add(torrentId, { path: outputPath }, (torrent) => {
    console.log(`Downloading: ${torrent.name}`);

    torrent.on("download", (bytes) => {
      console.log(
        `Progress: ${(torrent.progress * 100).toFixed(2)}% - Downloaded: ${(
          torrent.downloaded /
          (1024 * 1024)
        ).toFixed(2)} MB`
      );
    });

    torrent.on("done", () => {
      console.log(`Download complete: ${torrent.name}`);
      client.destroy();
    });
  });

  client.on("error", (err) => {
    console.error(`Error: ${err.message}`);
  });
}

// Get torrent input from the command line
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node torrentDownloader.js <torrent-file-path or magnet-link> [output-directory]"
  );
  process.exit(1);
}

const torrentInput = args[0];
const outputDirectory = args[1] || "./downloads";

// Start downloading
downloadTorrent(torrentInput, outputDirectory);
