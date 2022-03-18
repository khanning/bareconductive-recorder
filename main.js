let trackSelector = null;
let player = null;
let startButton = null;
let stopButton = null;
let  downloadButton = null;
let statusContainer = null;
let statusTag = null;
let statusTicker = null;

let downloadLink = document.createElement('a');

let webAudioRecorder = null;

let currentBlobURI = null;

let recording = false;

let selectedTrack = 0;
let selectorDivs = [];

let ticker = null;
let startTime = 0;
let recordingTimeout = null;

async function start() {
  trackSelector = document.getElementById('track-selector');
  player = document.getElementById('audio-player');
  startButton = document.getElementById('start');
  // stopButton = document.getElementById('stop');
  downloadButton = document.getElementById('download-icon');
  statusContainer = document.getElementById('status');
  statusTag = document.getElementById('status-label');
  statusTicker = document.getElementById('status-counter');

  startButton.onclick = startRecording;
  // stopButton.onclick = stopRecording;
  downloadButton.onclick = downloadRecording;

  for (let i=0; i<12; i++) {
    const div = document.createElement('div');
    div.className = (i === selectedTrack) ? 'selector selected' : 'selector';
    div.innerHTML = i;
    div.onclick = e => {
      selectorDivs[selectedTrack].className = 'selector';
      selectedTrack = i;
      selectorDivs[selectedTrack].className = 'selector selected';
    }
    selectorDivs.push(div);
    trackSelector.appendChild(div);
  }

  const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
  let AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  let source = audioContext.createMediaStreamSource(stream);
  webAudioRecorder = new WebAudioRecorder(source, {
    workerDir: 'web-audio-recorder-js/lib-minified/',
    encoding: 'mp3',
    options: {
      encodeAfterRecord: true,
      mp3: { bitRate: '320' }
    }
  });
  webAudioRecorder.onComplete = (recorder, blob) => {
    var reader = new FileReader();
    reader.onload = e => {
      currentBlobURI = e.target.result;
      player.src = e.target.result;
      statusContainer.className = '';
      statusTag.innerHTML = '&nbsp;';
      downloadButton.className = 'download-icon ready';
    }
    reader.readAsDataURL(blob);
  }
}

function startRecording() {
  if (recording) {
    stopRecording();
  } else {
    statusContainer.className = 'status-recording';
    statusTag.innerHTML = 'Recording';
    startTime = Date.now();
    statusTicker.innerHTML = '&nbsp;0.0s';
    downloadButton.className = 'download-icon disabled';
    player.src = null;
    setTimeout(() => {
      webAudioRecorder.startRecording()
      ticker = setInterval(() => {
        let time = (Date.now() - startTime) / 1000;
        statusTicker.innerHTML = `&nbsp;${time.toFixed(1)}s`;
      }, 50);
      recordingTimeout = setTimeout(stopRecording, 30000);
    }, 150);
    recording = true;
  }
}

function stopRecording() {
  clearTimeout(recordingTimeout);
  statusContainer.className = 'status-processing';
  statusTag.innerHTML = 'Processing';
  statusTicker.innerHTML = '';
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
  webAudioRecorder.finishRecording();
  startButton.style.backgroundImage = 'url("assets/record.svg")';
  recording = false;
}

function paddedTrack() {
  return String(selectedTrack).padStart(2, '0');
}

function downloadRecording() {
  if (!currentBlobURI) return;
  downloadLink.href = currentBlobURI;
  downloadLink.download = `TRACK0${paddedTrack()}.mp3`;
  downloadLink.click();
}

window.onload = start;
