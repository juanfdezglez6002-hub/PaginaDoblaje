// --- VARIABLES GLOBALES ---
const videoPlayer = document.getElementById('mainVideo');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const tracksArea = document.getElementById('tracks-area');
const zoomSlider = document.getElementById('zoomSlider');

let mediaRecorder;
let audioChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Web Audio API nativa

// --- 1. GRABACIÓN BÁSICA ---
recordBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        crearClipDeAudio(audioUrl);
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

// --- 2. CREAR CLIP Y ARRASTRAR (DRAG & DROP NATIVO) ---
function crearClipDeAudio(url) {
    // Creamos el contenedor visual del clip
    const clipDiv = document.createElement('div');
    clipDiv.className = 'audio-clip';
    clipDiv.style.position = 'absolute'; // Vital para poder moverlo
    clipDiv.style.left = '0px'; 
    clipDiv.style.width = '200px'; // Ancho inicial de ejemplo
    clipDiv.style.backgroundColor = '#bb86fc';
    clipDiv.style.cursor = 'grab';
    
    // Creamos el elemento de audio real
    const audioEl = document.createElement('audio');
    audioEl.src = url;
    clipDiv.appendChild(audioEl);

    // LÓGICA DE MOVER CON EL RATÓN (Sin librerías)
    let isDragging = false;
    let startX;
    let initialLeft;

    clipDiv.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        initialLeft = parseInt(clipDiv.style.left || 0, 10);
        clipDiv.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        // Movemos el clip horizontalmente por el timeline
        clipDiv.style.left = `${Math.max(0, initialLeft + dx)}px`; 
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            clipDiv.style.cursor = 'grab';
        }
    });

    // Añadimos el clip a la pista
    document.querySelector('.track-content').appendChild(clipDiv);
}

// --- 3. ZOOM VISUAL ---
// Multiplicamos el ancho del contenedor de pistas. 
// Al hacerse más ancho, los elementos absolutos se separan visualmente (efecto lupa).
zoomSlider.addEventListener('input', (e) => {
    const zoomLevel = e.target.value;
    // Si el zoom es 2, el ancho será el 200%
    tracksArea.style.width = `${zoomLevel * 100}%`; 
});

// --- 4. MUTE Y SOLO (Nativo) ---
// Seleccionamos todos los botones de Mute
document.querySelectorAll('.btn-mute').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Buscamos la pista a la que pertenece este botón
        const track = e.target.closest('.track-lane');
        // Buscamos todos los audios dentro de esa pista
        const audios = track.querySelectorAll('audio');
        
        // Alternamos el estado silenciado de los audios nativos de HTML5
        audios.forEach(audio => {
            audio.muted = !audio.muted;
        });

        // Cambiamos el color del botón para que se note visualmente
        e.target.style.backgroundColor = audios[0].muted ? '#ff5252' : '#444';
    });
});

// --- 5. CORTAR PISTA (SPLIT - Concepto Básico Nativo) ---
document.getElementById('splitBtn').addEventListener('click', () => {
    // Para no usar librerías complejas, el "Split" visual en Vanilla JS funciona clonando 
    // el elemento HTML del clip original y modificando visualmente el ancho de ambos,
    // ajustando el momento en el que empieza a sonar uno y otro.
    
    // *Nota para el desarrollo futuro: Para cortar el archivo real milimétricamente y 
    // exportarlo después, usaríamos audioContext.decodeAudioData() para dividir el 
    // array de sonido (Buffer) nativamente.*
    alert('Herramienta de corte activada (Lógica de clonado de nodos HTML a implementar aquí)');
});
