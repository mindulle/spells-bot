const { spawn } = require('child_process');
const ffmpegProcess = spawn('ffmpeg', [
  '-re',
  '-reconnect', '1',
  '-reconnect_at_eof', '1',
  '-reconnect_on_network_error', '1',
  '-reconnect_streamed', '1',
  '-reconnect_delay_max', '5',
  '-err_detect', 'ignore_err',
  '-i', 'https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm',
  '-loglevel', 'warning',
  '-f', 's16le',
  '-ar', '48000',
  '-ac', '2',
  'pipe:1',
]);
ffmpegProcess.stderr.on('data', d => console.error(d.toString()));
ffmpegProcess.on('close', c => console.log('code', c));
