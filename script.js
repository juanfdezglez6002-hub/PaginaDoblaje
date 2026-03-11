document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('mainVideo');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const trackContent1 = document.getElementById('trackContent1');

    let mediaRecorder;
    let audioChunks = [];

    // --- CORRECCIÓN: CARGA DE VÍDEO ---
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            videoPlayer.src = fileURL;
            videoPlayer.load(); // Forzamos la carga
            videoPlayer.onloadedmetadata = () => {
                console.log("Vídeo cargado correctamente");
            };
        }
    });

    // --- GRABACIÓN ---
    recordBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                crearClip(audioUrl);
                audioChunks = [];
            };

            audioChunks = [];
            mediaRecorder.start();
            videoPlayer.play();
            recordBtn.disabled = true;
            stopBtn.disabled = false;
        } catch (err) {
            alert("Error al acceder al micro: " + err);
        }
    };

    stopBtn.onclick = () => {
        mediaRecorder.stop();
        videoPlayer.pause();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    };

    // --- CLIPS MOVIBLES (DRAG & DROP) ---
    function crearClip(url) {
        const clip = document.createElement('div');
        clip.className = 'audio-clip';
        clip.innerText = "Grabación " + (trackContent1.children.length + 1);
        clip.style.position = 'absolute';
        clip.style.left = '0px';
        clip.style.width = '150px'; // Tamaño base

        // Audio interno
        const audio = new Audio(url);
        clip.onclick = () => audio.play(); // Reproducir al hacer click

        // Lógica de arrastre manual
        let isDragging = false;
        let startX;
        let initialLeft;

        clip.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            initialLeft = parseInt(clip.style.left);
            clip.style.cursor = 'grabbing';
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            clip.style.left = (initialLeft + deltaX) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            clip.style.cursor = 'grab';
        });

        trackContent1.appendChild(clip);
    }

    // --- ZOOM ---
    const zoomSlider = document.getElementById('zoomSlider');
    zoomSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        trackContent1.style.transform = `scaleX(${val})`;
        trackContent1.style.transformOrigin = 'left';
    });
});
