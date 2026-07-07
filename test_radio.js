const { spawn } = require('child_process');
const axios = require('axios');

async function test() {
  const response = await axios.get('https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm', { responseType: 'text' });
  const streamUrl = response.data.trim();
  console.log('Stream URL:', streamUrl);

  const ffmpegProcess = spawn('ffmpeg', [
    '-i', streamUrl,
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
    '-t', '5', // Just 5 seconds
    'pipe:1',
  ]);

  ffmpegProcess.stderr.on('data', d => console.error('FFMPEG LOG:', d.toString()));
  let bytes = 0;
  ffmpegProcess.stdout.on('data', d => { bytes += d.length; });
  ffmpegProcess.on('close', code => {
    console.log('Done, code', code, 'total bytes:', bytes);
  });
}
test();
