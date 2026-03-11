const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('mainVideo');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

let mediaRecorder;
let audioChunks = [];

// Cargar el vídeo del usuario
videoInput.addEventListener('change', function() {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
});

// Lógica de grabación (Básico)
recordBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        addTrackToTimeline(audioUrl);
        audioChunks = [];
    };

    mediaRecorder.start();
    videoPlayer.play();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    videoPlayer.pause();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
};

function addTrackToTimeline(url) {
    const trackArea = document.getElementById('tracks-area');
    const newTrack = document.createElement('div');
    newTrack.className = 'track-lane';
    newTrack.innerHTML = `<audio controls src="${url}" style="width: 100%; height: 100%"></audio>`;
    trackArea.appendChild(newTrack);
}
