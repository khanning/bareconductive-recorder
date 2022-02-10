let trackSelector = null;
let player = null;
let startButton = null;
let stopButton = null;
let downloadButton = null;
let statusTag = null;

let downloadLink = document.createElement('a');

let webAudioRecorder = null;

let currentBlobURI = null;

let recording = false;

let selectedTrack = 0;
let selectorDivs = [];

async function start() {
  trackSelector = document.getElementById('track-selector');
  player = document.getElementById('audio-player');
  startButton = document.getElementById('start');
  // stopButton = document.getElementById('stop');
  downloadButton = document.getElementById('download');
  statusTag = document.getElementById('status');

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
      statusTag.className = '';
      statusTag.innerHTML = '&nbsp;';
      downloadButton.className = 'button ready';
    }
    reader.readAsDataURL(blob);
  }
}

function startRecording() {
  if (recording) {
    statusTag.className = 'status-processing';
    statusTag.innerHTML = 'Processing';
    webAudioRecorder.finishRecording();
    startButton.style.backgroundImage = 'url("assets/record.svg")';
    recording = false;
  } else {
    statusTag.className = 'status-recording';
    statusTag.innerHTML = 'Recording';
    downloadButton.className = 'button disabled';
    player.src = null;
    setTimeout(() => {
      webAudioRecorder.startRecording()
    }, 150);
    startButton.style.backgroundImage = 'url("assets/stop.svg")';
    recording = true;
  }
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
