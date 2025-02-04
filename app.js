import WebTorrent from "webtorrent";
import fs from "fs";
const client = new WebTorrent();

function downloadTorrent(torrentId, outputPath = "./downloads") {
  // Ensure the download directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log(`🚀 Starting torrent download for: ${torrentId}`);

  // Enhanced options for potentially faster connections:
  const options = {
    path: outputPath,
    announce: [
      // UDP Trackers
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://tracker.coppersurfer.tk:6969/announce",
      "udp://tracker.leechers-paradise.org:6969/announce",
      "udp://explodie.org:6969",
      "udp://tracker.torrent.eu.org:451",
      "udp://9.rarbg.to:2710",
      "udp://9.rarbg.me:2780/announce",
      "udp://tracker.internetwarriors.net:1337",
      // WebSocket Tracker for WebTorrent-hybrid (if available)
      "wss://tracker.openwebtorrent.com",
    ],
    maxConns: 2000, // Increase max connections further to maximize peer connections
    dht: true, // Enable DHT for peer discovery
    webSeeds: true, // Enable web seeding if available
  };

  client.add(torrentId, options, (torrent) => {
    console.log(`🎯 Now downloading: ${torrent.name}`);

    // Log progress every 10 seconds
    const progressInterval = setInterval(() => {
      const progress = (torrent.progress * 100).toFixed(2);
      const downloadedMB = (torrent.downloaded / (1024 * 1024)).toFixed(2);
      const speedMBps = (torrent.downloadSpeed / (1024 * 1024)).toFixed(2);
      const etaSec = (torrent.timeRemaining / 1000).toFixed(2);
      console.log(
        `📊 Progress: ${progress}% | 📥 Downloaded: ${downloadedMB} MB | 🚀 Speed: ${speedMBps} MB/s | ⏳ ETA: ${etaSec} sec | 👥 Peers: ${torrent.numPeers}`
      );
    }, 10 * 1000);

    torrent.on("done", () => {
      clearInterval(progressInterval);
      console.log(`✅ Download complete: ${torrent.name}`);
      client.destroy();
    });

    torrent.on("error", (err) => {
      clearInterval(progressInterval);
      console.error(`❌ Torrent error: ${err.message}`);
      client.destroy();
    });
  });

  client.on("error", (err) => {
    console.error(`❌ Client error: ${err.message}`);
  });
}

// Command-line argument parsing
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "⚠️ Usage: node torrentDownloader.js <torrent-file-path or magnet-link> [output-directory]"
  );
  process.exit(1);
}

const torrentInput = args[0];
const outputDirectory = args[1] || "./downloads";

// Start the download
downloadTorrent(torrentInput, outputDirectory);
