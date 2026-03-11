const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('mainVideo');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const trackContent1 = document.getElementById('trackContent1');
const zoomSlider = document.getElementById('zoomSlider');
const muteVideoBtn = document.getElementById('muteVideoBtn');

let mediaRecorder;
let audioChunks = [];

// 1. CARGA DE VÍDEO (Tu versión original)
videoInput.addEventListener('change', function() {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
});

// 2. GRABACIÓN
recordBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        crearClip(audioUrl);
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

// 3. CREAR CLIP Y ARRASTRAR (Drag nativo)
function crearClip(url) {
    const clip = document.createElement('div');
    clip.className = 'audio-clip';
    clip.style.left = '0px';
    clip.style.width = '120px';
    clip.innerText = "Audio " + (trackContent1.children.length + 1);

    const audio = new Audio(url);
    clip.ondblclick = () => audio.play(); // Doble click para escuchar

    // Lógica de arrastre
    let xInicial, leftInicial, moviendose = false;

    clip.onmousedown = (e) => {
        moviendose = true;
        xInicial = e.clientX;
        leftInicial = parseInt(clip.style.left);
        clip.style.cursor = 'grabbing';
    };

    document.onmousemove = (e) => {
        if (!moviendose) return;
        let diff = e.clientX - xInicial;
        clip.style.left = Math.max(0, leftInicial + diff) + "px";
    };

    document.onmouseup = () => {
        moviendose = false;
        clip.style.cursor = 'grab';
    };

    trackContent1.appendChild(clip);
}

// 4. ZOOM
zoomSlider.oninput = () => {
    trackContent1.style.transform = `scaleX(${zoomSlider.value})`;
    trackContent1.style.transformOrigin = 'left';
};

// 5. MUTE VIDEO
muteVideoBtn.onclick = () => {
    videoPlayer.muted = !videoPlayer.muted;
    muteVideoBtn.innerText = videoPlayer.muted ? "Unmute Video" : "Mute Video";
};
