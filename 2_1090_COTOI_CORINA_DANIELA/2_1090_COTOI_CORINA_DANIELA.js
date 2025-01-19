let accounts = JSON.parse(localStorage.getItem("accounts")) || [
    { email: "danielacotoi232@gmail.com", password: "dani2004" },
    { email: "catalindrago@gmail.com", password: "cata2001" }
];

function saveAccountsToLocalStorage() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    const account = accounts.find(acc => acc.email === email && acc.password === password);
    if (account) {
        errorMessage.textContent = "";
        alert("Autentificare reușită!");

        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("videoContainer").style.display = "block";
        
        initCanvases();
        showPlaylist();
        
        document.querySelector(".main-title").style.display = "none";
        const hearts = document.querySelectorAll(".heart");
        hearts.forEach(heart => heart.style.display = "none");

        clearInterval(heartInterval);
    } else {
        const existingEmail = accounts.some(acc => acc.email === email);
        if (existingEmail) {
            errorMessage.textContent = "Parola incorectă!";
        } else {
            errorMessage.textContent = "Nu există cont cu acest email.";
            document.getElementById("signUpLink").style.display = "block";
        }
    }
}

function showSignUp() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("signUpContainer").style.display = "block";
}

function signUp() {
    const newEmail = document.getElementById("newEmail").value;
    const newPassword = document.getElementById("newPassword").value;
    const signUpMessage = document.getElementById("signUpMessage");

    const existingAccount = accounts.find(acc => acc.email === newEmail);
    if (existingAccount) {
        signUpMessage.textContent = "Există deja un cont cu acest email.";
    } else {
        accounts.push({ email: newEmail, password: newPassword });
        saveAccountsToLocalStorage();

        signUpMessage.textContent = "Cont creat cu succes!";
        setTimeout(() => {
            document.getElementById("signUpContainer").style.display = "none";
            document.getElementById("loginContainer").style.display = "block";
            document.getElementById("errorMessage").textContent = "";
            document.getElementById("signUpLink").style.display = "none";
        }, 1500);
    }
}

function createHeart() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    document.body.appendChild(heart);

    const size = Math.random() * 30 + 20 + "px";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = size;
    heart.style.animationDuration = Math.random() * 3 + 3 + "s";

    heart.addEventListener("animationend", () => {
        heart.remove();
    });
}

function startHeartAnimations() {
    if (document.body.innerHTML.includes("loginContainer")) {
        heartInterval = setInterval(createHeart, 300);
    }
}

window.addEventListener('load', function() {
    startHeartAnimations();
});

function setupVideoCanvasWithControls(videoId, canvasId) {
    const controlsHeight = 50;
    const buttonSize = 40;
    const progressBarHeight = 10;
    const volumeBarWidth = 100;
    const previewSize = { width: 160, height: 90 };

    let controlsVisible = false;
    let isPlaying = false;
    let mouseX = 0;
    let mouseY = 0;
    let showingPreview = false;
    let isDraggingTimeline = false;
    
    const video = document.getElementById(videoId);
    video.crossOrigin = "anonymous";
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = previewSize.width;
    previewCanvas.height = previewSize.height;
    const previewCtx = previewCanvas.getContext('2d');

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function desenează() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (controlsVisible) {
            deseneazaControale();
        }

        if (showingPreview) {
            deseneazaPreview();
        }

        if (!video.paused && !video.ended) {
            requestAnimationFrame(desenează);
        }
    }

    function deseneazaPreview() {
        const previewY = canvas.height - controlsHeight - previewSize.height - 10;
        let previewX = mouseX - (previewSize.width / 2);
        previewX = Math.max(0, Math.min(canvas.width - previewSize.width, previewX));
        
        const hoverPosition = mouseX / canvas.width;
        const previewTime = video.duration * hoverPosition;
    
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(previewX, previewY, previewSize.width, previewSize.height);
    
        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = previewSize.width;
            tempCanvas.height = previewSize.height;
            const tempCtx = tempCanvas.getContext('2d');
    
            const currentTime = video.currentTime;
            video.pause();
            video.currentTime = previewTime;
    
            video.addEventListener('seeked', function onSeeked() {
                tempCtx.drawImage(
                    video,
                    0, 0, video.videoWidth, video.videoHeight,
                    0, 0, previewSize.width, previewSize.height
                );
                ctx.drawImage(tempCanvas, previewX, previewY);
    
                const timestamp = formatTime(previewTime);
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    timestamp,
                    previewX + previewSize.width / 2,
                    previewY + previewSize.height + 15
                );
    
                video.currentTime = currentTime;
                if (!video.paused) video.play();
    
                video.removeEventListener('seeked', onSeeked);
            }, { once: true });
        } catch (error) {
            console.warn('Eroare la previzualizare:', error);
        }
    }
    

    function deseneazaControale() {
        const controlsY = canvas.height - controlsHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, controlsY, canvas.width, controlsHeight);

        const progress = (video.currentTime / video.duration) * canvas.width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, canvas.height - progressBarHeight, canvas.width, progressBarHeight);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, canvas.height - progressBarHeight, progress, progressBarHeight);

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(formatTime(video.currentTime), 10, controlsY + 35);
        ctx.textAlign = 'right';
        ctx.fillText(formatTime(video.duration), canvas.width - 10, controlsY + 35);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 90, controlsY + 25);
        ctx.lineTo(canvas.width / 2 - 90, controlsY + 35);
        ctx.lineTo(canvas.width / 2 - 100, controlsY + 30);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 80, controlsY + 25);
        ctx.lineTo(canvas.width / 2 - 80, controlsY + 35);
        ctx.lineTo(canvas.width / 2 - 90, controlsY + 30);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (isPlaying) {
            ctx.fillRect(canvas.width / 2 - 50, controlsY + 15, 5, 20);
            ctx.fillRect(canvas.width / 2 - 30, controlsY + 15, 5, 20);
        } else {
            ctx.moveTo(canvas.width / 2 - 48, controlsY + 15);
            ctx.lineTo(canvas.width / 2 - 48, controlsY + 35);
            ctx.lineTo(canvas.width / 2 - 30, controlsY + 25);
            ctx.closePath();
            ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 80, controlsY + 25);  
        ctx.lineTo(canvas.width / 2 + 80, controlsY + 35);
        ctx.lineTo(canvas.width / 2 + 90, controlsY + 30);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 90, controlsY + 25);
        ctx.lineTo(canvas.width / 2 + 90, controlsY + 35);
        ctx.lineTo(canvas.width / 2 + 100, controlsY + 30);
        ctx.closePath();
        ctx.fill();

        const volumeX = canvas.width / 2 + 120;
        const volumeY = controlsY + 15;
        ctx.fillStyle = 'white';
        ctx.fillRect(volumeX, volumeY, volumeBarWidth, 10);

        ctx.fillStyle = 'green';
        ctx.fillRect(volumeX, volumeY, video.volume * volumeBarWidth, 10);

        const handleX = volumeX + video.volume * volumeBarWidth - 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(handleX, volumeY - 5, 10, 20);
    }

    function handleNextPrevious(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const controlsY = canvas.height - controlsHeight;

        if (y > controlsY && y < controlsY + controlsHeight &&
            x > canvas.width / 2 - 100 && x < canvas.width / 2 - 80) {
            video.currentTime = Math.max(0, video.currentTime - 2);
        }

        if (y > controlsY && y < controlsY + controlsHeight &&
            x > canvas.width / 2 + 80 && x < canvas.width / 2 + 100) {
            video.currentTime = Math.min(video.duration, video.currentTime + 2);
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        const isOverProgressBar = mouseY > canvas.height - progressBarHeight - 10 &&
                                mouseY < canvas.height;

        showingPreview = isOverProgressBar && !isDraggingTimeline;
        controlsVisible = mouseY > canvas.height - controlsHeight;

        if (controlsVisible || showingPreview) {
            requestAnimationFrame(desenează);
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;

        if (y > canvas.height - progressBarHeight) {
            isDraggingTimeline = true;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDraggingTimeline = false;
    });

    canvas.addEventListener('mouseleave', () => {
        showingPreview = false;
        controlsVisible = false;
        requestAnimationFrame(desenează);
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const controlsY = canvas.height - controlsHeight;

        if (y > canvas.height - progressBarHeight) {
            const clickPosition = x / canvas.width;
            video.currentTime = clickPosition * video.duration;
        } else if (y > controlsY) {
            if (x > canvas.width / 2 - 60 && x < canvas.width / 2 - 20) {
                if (video.paused) {
                    video.play();
                    isPlaying = true;
                } else {
                    video.pause();
                    isPlaying = false;
                }
            }

            const volumeX = canvas.width / 2 + 120;
            if (x >= volumeX && x <= volumeX + volumeBarWidth &&
                y >= controlsY + 15 && y <= controlsY + 25) {
                const newVolume = (x - volumeX) / volumeBarWidth;
                video.volume = Math.min(Math.max(newVolume, 0), 1);
            }
            handleNextPrevious(e);
        }
    });

    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        desenează();
    });

    video.addEventListener('play', () => {
        isPlaying = true;
        desenează();
    });

    video.addEventListener('pause', () => {
        isPlaying = false;
        desenează();
    });

    video.addEventListener('timeupdate', desenează);
    return {
        onNext: (callback) => {
            onNext = callback;
        },
        onPrevious: (callback) => {
            onPrevious = callback;
        }
    };
}

function initCanvases() {
    setupVideoCanvasWithControls('video1', 'canvas1');
    setupVideoCanvasWithControls('video2', 'canvas2');
    setupVideoCanvasWithControls('video3', 'canvas3');
    setupVideoCanvasWithControls('video4', 'canvas4');
    setupVideoCanvasWithControls('video5', 'canvas5');
}
const videos = [
    { id: 'video1', canvas: 'canvas1', title: 'LONG STORY SHORT Trailer (2021)' },
    { id: 'video2', canvas: 'canvas2', title: 'REAPPEAR - British Short Film' },
    { id: 'video3', canvas: 'canvas3', title: 'REACHER Season 3 - Official TraileR' },
    { id: 'video4', canvas: 'canvas4', title: 'FALLEN Trailer Official (2024)' },
    { id: 'video5', canvas: 'canvas5', title: 'The Amateur_Official Trailer.mp4' }
];


let currentVideoIndex = 0;

document.getElementById("addTrailerButton").addEventListener("click", function () {
    const trailerInput = document.getElementById("addTrailerInput");
    trailerInput.value = "";

    trailerInput.addEventListener(
        "change",
        function handleFileSelect(event) {
            const file = event.target.files[0];

            if (file && file.type.startsWith("video/")) {
                if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
                    alert("Formatul de fișier nu este acceptat. Utilizați MP4, WebM sau Ogg.");
                    return;
                }

                const videoUrl = URL.createObjectURL(file);

                const videoId = `video${videos.length + 1}`;
                const canvasId = `canvas${videos.length + 1}`;

                const videoWrapper = document.createElement("div");
                videoWrapper.classList.add("video-player");

                const videoElement = document.createElement("video");
                videoElement.crossOrigin = "anonymous";
                videoElement.id = videoId;
                videoElement.src = videoUrl;
                videoElement.style.display = "none";
                videoElement.preload = "auto";
                videoWrapper.appendChild(videoElement);

                const canvasElement = document.createElement("canvas");
                canvasElement.id = canvasId;
                canvasElement.width = 800;
                canvasElement.height = 450;
                canvasElement.style.display = "block";
                videoWrapper.appendChild(canvasElement);

                const videoContainer = document.querySelector(".video-canvas-container");
                videoContainer.appendChild(videoWrapper);

                const newVideo = {
                    id: videoId,
                    canvas: canvasId,
                    title: file.name,
                };
                videos.push(newVideo);

                videoElement.addEventListener("loadeddata", () => {
                    setupVideoCanvasWithControls(videoId, canvasId);
                    updatePlaylist();
                    selectVideo(videos.length - 1);
                    const ctx = canvasElement.getContext("2d");
                    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    alert("Trailer adăugat cu succes!");
                });

                videoElement.addEventListener("ended", handleVideoEnd);

                updatePlaylist();
            } else {
                alert("Vă rugăm să încărcați un fișier video valid.");
            }
        },
        { once: true }
    );

    trailerInput.click();
});

function selectVideo(index) {
    currentVideoIndex = index;

    videos.forEach((video, i) => {
        const videoElement = document.getElementById(video.id);
        const canvasElement = document.getElementById(video.canvas);
        
        if (i === index) {
            if (videoElement && canvasElement) {
                videoElement.style.display = "none";
                canvasElement.style.display = "block";
                const ctx = canvasElement.getContext('2d');
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
                
                ctx.beginPath();
                ctx.fillStyle = 'white';
                const centerX = canvasElement.width / 2;
                const centerY = canvasElement.height / 2;
                ctx.moveTo(centerX - 30, centerY - 30);
                ctx.lineTo(centerX - 30, centerY + 30);
                ctx.lineTo(centerX + 30, centerY);
                ctx.closePath();
                ctx.fill();
                
                canvasElement.onclick = function(e) {
                    videoElement.play().then(() => {
                        canvasElement.onclick = null;
                    }).catch(error => {
                        console.error("Eroare la redarea video-ului:", error);
                    });
                };
            }
        } else {
            if (videoElement && canvasElement) {
                videoElement.pause();
                videoElement.style.display = "none";
                canvasElement.style.display = "none";
            }
        }
    });
}

function handleVideoEnd() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    selectVideo(currentVideoIndex);
}

videos.forEach(video => {
    const videoElement = document.getElementById(video.id);
    videoElement.addEventListener('ended', handleVideoEnd);
});

function showPlaylist() {
    document.getElementById('playlistContainer').style.display = 'block';
    selectVideo(0);
}

function moveVideoUp(index) {
    if (index > 0) {
        const temp = videos[index];
        videos[index] = videos[index - 1];
        videos[index - 1] = temp;
        
        updatePlaylist();
        
        selectVideo(index - 1);
    }
}

function moveVideoDown(index) {
    if (index < videos.length - 1) {
        const temp = videos[index];
        videos[index] = videos[index + 1];
        videos[index + 1] = temp;
        
        updatePlaylist();
        
        selectVideo(index + 1);
    }
}

function deleteVideo(index) {
    const removedVideo = videos.splice(index, 1)[0];
    
    if (removedVideo) {
        const videoElement = document.getElementById(removedVideo.id);
        const canvasElement = document.getElementById(removedVideo.canvas);
        if (videoElement) videoElement.remove();
        if (canvasElement) canvasElement.remove();
    }
    updatePlaylist();

    if (videos.length > 0) {
        selectVideo(0);
    } else {
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('playlistContainer').style.display = 'none';
    }
}


function updatePlaylist() {
    const playlistContainer = document.getElementById("playlist");
    playlistContainer.innerHTML = "";

    videos.forEach((video, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("playlist-item");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = video.title;
        titleSpan.onclick = () => selectVideo(index);
        listItem.appendChild(titleSpan);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("playlist-buttons");

        if (index > 0) {
            const upButton = document.createElement("button");
            upButton.textContent = "⬆";
            upButton.onclick = (e) => {
                e.stopPropagation();
                moveVideoUp(index);
            };
            buttonContainer.appendChild(upButton);
        }

        if (index < videos.length - 1) {
            const downButton = document.createElement("button");
            downButton.textContent = "⬇";
            downButton.onclick = (e) => {
                e.stopPropagation();
                moveVideoDown(index);
            };
            buttonContainer.appendChild(downButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteVideo(index);
        };
        buttonContainer.appendChild(deleteButton);

        listItem.appendChild(buttonContainer);
        playlistContainer.appendChild(listItem);
    });
}

updatePlaylist();

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 5;
        this.maxSize = Math.random() * 20 + 15;
        this.speed = Math.random() * 0.2 + 0.1;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.growing = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
        if (this.growing) {
            this.size += this.speed;
            if (this.size >= this.maxSize) {
                this.growing = false;
            }
        } else {
            this.size -= this.speed;
            if (this.size <= 0) {
                this.reset();
                this.growing = true;
            }
        }
        this.rotation += this.rotationSpeed;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.beginPath();

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;

            if (i === 0) {
                this.ctx.moveTo(Math.cos(angle) * this.size, Math.sin(angle) * this.size);
            } else {
                this.ctx.lineTo(Math.cos(angle) * this.size, Math.sin(angle) * this.size);
            }

            this.ctx.lineTo(
                Math.cos(innerAngle) * (this.size / 2),
                Math.sin(innerAngle) * (this.size / 2)
            );
        }

        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        this.ctx.fill();
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha + 0.1})`;
        this.ctx.stroke();
        this.ctx.restore();
    }
}

function initializeStarEffects() {
    const stars = new Map();
    const effectsCanvases = new Map();
    let animationId = null;
    let effectsActive = false;

    let effectsButton = document.querySelector('.stars-button');
    if (!effectsButton) {
        effectsButton = document.createElement('button');
        effectsButton.textContent = 'Afișare Stele';
        effectsButton.className = 'stars-button';
        const videoContainer = document.querySelector('.video-container');
        videoContainer.insertBefore(effectsButton, videoContainer.firstChild);
    }

    function setupEffectsForCanvas(video) {
        const canvasElement = document.getElementById(video.canvas);
        if (!canvasElement) return;

        let effectsCanvas = document.getElementById(`effectsCanvas-${video.canvas}`);
        if (!effectsCanvas) {
            effectsCanvas = document.createElement('canvas');
            effectsCanvas.id = `effectsCanvas-${video.canvas}`;
            effectsCanvas.style.position = 'absolute';
            effectsCanvas.style.top = '0';
            effectsCanvas.style.left = '0';
            effectsCanvas.style.pointerEvents = 'none';
            effectsCanvas.style.zIndex = '2';
            canvasElement.parentNode.style.position = 'relative';
            canvasElement.parentNode.appendChild(effectsCanvas);
        }

        stars.set(video.canvas, []);
        effectsCanvases.set(video.canvas, effectsCanvas);
        
        if (effectsActive) {
            resizeCanvas(video, effectsCanvas);
            initStarsForCanvas(video.canvas);
        }
    }

    function resizeCanvas(video, effectsCanvas) {
        const canvasElement = document.getElementById(video.canvas);
        const canvasRect = canvasElement.getBoundingClientRect();
        effectsCanvas.width = canvasRect.width;
        effectsCanvas.height = canvasRect.height;
        effectsCanvas.style.width = `${canvasRect.width}px`;
        effectsCanvas.style.height = `${canvasRect.height}px`;
    }

    function initStarsForCanvas(canvasId) {
        const starArray = [];
        const effectsCanvas = effectsCanvases.get(canvasId);
        if (effectsCanvas) {
            for (let i = 0; i < 30; i++) {
                starArray.push(new Star(effectsCanvas));
            }
            stars.set(canvasId, starArray);
        }
    }

    function animate() {
        videos.forEach((video) => {
            const effectsCanvas = effectsCanvases.get(video.canvas);
            if (!effectsCanvas) return;

            const ctx = effectsCanvas.getContext('2d');
            ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

            const starArray = stars.get(video.canvas);
            if (starArray) {
                starArray.forEach((star) => {
                    star.update();
                    star.draw();
                });
            }
        });

        if (effectsActive) {
            animationId = requestAnimationFrame(animate);
        }
    }

    videos.forEach(setupEffectsForCanvas);

    const videoContainer = document.querySelector('.video-canvas-container');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('video-player')) {
                    const newVideo = videos[videos.length - 1];
                    if (newVideo) {
                        setupEffectsForCanvas(newVideo);
                    }
                }
            });
        });
    });

    observer.observe(videoContainer, { childList: true });

    effectsButton.addEventListener('click', () => {
        effectsActive = !effectsActive;
        effectsButton.textContent = effectsActive ? 'Oprire Stele' : 'Afișare Stele';
        effectsButton.classList.toggle('active', effectsActive);

        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initStarsForCanvas(video.canvas));
            animate();
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                videos.forEach((video) => {
                    const effectsCanvas = effectsCanvases.get(video.canvas);
                    if (effectsCanvas) {
                        const ctx = effectsCanvas.getContext('2d');
                        ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
                    }
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initStarsForCanvas(video.canvas));
        }
    });
}

initializeStarEffects();

const style = document.createElement('style');
document.head.appendChild(style);

class Sparkle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 6 + 3;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.life = Math.random() * 0.5 + 0.5;
        this.opacity = 1;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [
            '#FFD700', // Auriu
            '#FF69B4', // Roz
            '#4169E1', // Albastru
            '#7FFF00', // Verde
            '#FF4500'  // Portocaliu
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.01;
        this.size -= 0.01;

        if (this.opacity <= 0 || this.size <= 0 || 
            this.x < 0 || this.x > this.canvas.width || 
            this.y < 0 || this.y > this.canvas.height) {
            this.reset();
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.color;
    
        const gradient = this.ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 1.5
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.restore();
    }
}

function initializeSparkleEffects() {
    const sparkles = new Map();
    const effectsCanvases = new Map();
    let animationId = null;
    let effectsActive = false;

    let sparkleButton = document.querySelector('.sparkles-button');
    if (!sparkleButton) {
        sparkleButton = document.createElement('button');
        sparkleButton.textContent = 'Afișare Scântei';
        sparkleButton.className = 'sparkles-button';
        sparkleButton.style.marginLeft = '10px';
        const videoContainer = document.querySelector('.video-container');
        videoContainer.insertBefore(sparkleButton, videoContainer.firstChild);
    }

    function setupEffectsForCanvas(video) {
        const canvasElement = document.getElementById(video.canvas);
        if (!canvasElement) return;

        let effectsCanvas = document.getElementById(`sparkleCanvas-${video.canvas}`);
        if (!effectsCanvas) {
            effectsCanvas = document.createElement('canvas');
            effectsCanvas.id = `sparkleCanvas-${video.canvas}`;
            effectsCanvas.style.position = 'absolute';
            effectsCanvas.style.top = '0';
            effectsCanvas.style.left = '0';
            effectsCanvas.style.pointerEvents = 'none';
            effectsCanvas.style.zIndex = '3';
            canvasElement.parentNode.appendChild(effectsCanvas);
        }

        sparkles.set(video.canvas, []);
        effectsCanvases.set(video.canvas, effectsCanvas);
        
        if (effectsActive) {
            resizeCanvas(video, effectsCanvas);
            initSparklesForCanvas(video.canvas);
        }
    }

    function resizeCanvas(video, effectsCanvas) {
        const canvasElement = document.getElementById(video.canvas);
        const canvasRect = canvasElement.getBoundingClientRect();
        effectsCanvas.width = canvasRect.width;
        effectsCanvas.height = canvasRect.height;
        effectsCanvas.style.width = `${canvasRect.width}px`;
        effectsCanvas.style.height = `${canvasRect.height}px`;
    }

    function initSparklesForCanvas(canvasId) {
        const sparkleArray = [];
        const effectsCanvas = effectsCanvases.get(canvasId);
        if (effectsCanvas) {
            for (let i = 0; i < 50; i++) {
                sparkleArray.push(new Sparkle(effectsCanvas));
            }
            sparkles.set(canvasId, sparkleArray);
        }
    }

    function animate() {
        videos.forEach((video) => {
            const effectsCanvas = effectsCanvases.get(video.canvas);
            if (!effectsCanvas) return;

            const ctx = effectsCanvas.getContext('2d');
            ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

            const sparkleArray = sparkles.get(video.canvas);
            if (sparkleArray) {
                sparkleArray.forEach((sparkle) => {
                    sparkle.update();
                    sparkle.draw();
                });
            }
        });

        if (effectsActive) {
            animationId = requestAnimationFrame(animate);
        }
    }

    videos.forEach(setupEffectsForCanvas);

    const videoContainer = document.querySelector('.video-canvas-container');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('video-player')) {
                    const newVideo = videos[videos.length - 1];
                    if (newVideo) {
                        setupEffectsForCanvas(newVideo);
                    }
                }
            });
        });
    });

    observer.observe(videoContainer, { childList: true });

    sparkleButton.addEventListener('click', () => {
        effectsActive = !effectsActive;
        sparkleButton.textContent = effectsActive ? 'Oprire Scântei' : 'Afișare Scântei';
        sparkleButton.classList.toggle('active', effectsActive);

        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initSparklesForCanvas(video.canvas));
            animate();
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                videos.forEach((video) => {
                    const effectsCanvas = effectsCanvases.get(video.canvas);
                    if (effectsCanvas) {
                        const ctx = effectsCanvas.getContext('2d');
                        ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
                    }
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initSparklesForCanvas(video.canvas));
        }
    });
}
initializeSparkleEffects();

class ColorEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentColorIndex = 0;
        this.transitionProgress = 0;
        this.colors = [
            'rgba(255, 0, 0, 0.3)',    // Roșu
            'rgba(0, 0, 255, 0.3)',    // Albastru
            'rgba(0, 255, 0, 0.3)',    // Verde
            'rgba(255, 0, 255, 0.3)',  // Magenta
            'rgba(255, 165, 0, 0.3)',  // Portocaliu
            'rgba(138, 43, 226, 0.3)'  // Violet
        ];
        this.transitionSpeed = 0.02;
    }

    update() {
        this.transitionProgress += this.transitionSpeed;
        if (this.transitionProgress >= 1) {
            this.transitionProgress = 0;
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        }
    }

    draw() {
        const currentColor = this.colors[this.currentColorIndex];
        const nextColor = this.colors[(this.currentColorIndex + 1) % this.colors.length];
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, currentColor);
        gradient.addColorStop(this.transitionProgress, nextColor);
        gradient.addColorStop(1, currentColor);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function initializeColorEffects() {
    const colorEffects = new Map();
    const effectsCanvases = new Map();
    let animationId = null;
    let effectsActive = false;

    let colorButton = document.querySelector('.color-button');
    if (!colorButton) {
        colorButton = document.createElement('button');
        colorButton.textContent = 'Schimbare Culori';
        colorButton.className = 'color-button';
        const videoContainer = document.querySelector('.video-container');
        videoContainer.insertBefore(colorButton, videoContainer.firstChild);
    }

    function setupEffectsForCanvas(video) {
        const canvasElement = document.getElementById(video.canvas);
        if (!canvasElement) return;

        let effectsCanvas = document.getElementById(`colorCanvas-${video.canvas}`);
        if (!effectsCanvas) {
            effectsCanvas = document.createElement('canvas');
            effectsCanvas.id = `colorCanvas-${video.canvas}`;
            effectsCanvas.style.position = 'absolute';
            effectsCanvas.style.top = '0';
            effectsCanvas.style.left = '0';
            effectsCanvas.style.pointerEvents = 'none';
            effectsCanvas.style.zIndex = '1';
            canvasElement.parentNode.style.position = 'relative';
            canvasElement.parentNode.appendChild(effectsCanvas);
        }

        colorEffects.set(video.canvas, null);
        effectsCanvases.set(video.canvas, effectsCanvas);
        
        if (effectsActive) {
            resizeCanvas(video, effectsCanvas);
            initColorForCanvas(video.canvas);
        }
    }

    function resizeCanvas(video, effectsCanvas) {
        const canvasElement = document.getElementById(video.canvas);
        const canvasRect = canvasElement.getBoundingClientRect();
        effectsCanvas.width = canvasRect.width;
        effectsCanvas.height = canvasRect.height;
        effectsCanvas.style.width = `${canvasRect.width}px`;
        effectsCanvas.style.height = `${canvasRect.height}px`;
    }

    function initColorForCanvas(canvasId) {
        const effectsCanvas = effectsCanvases.get(canvasId);
        if (effectsCanvas) {
            const colorEffect = new ColorEffect(effectsCanvas);
            colorEffects.set(canvasId, colorEffect);
        }
    }

    function animate() {
        videos.forEach((video) => {
            const effectsCanvas = effectsCanvases.get(video.canvas);
            if (!effectsCanvas) return;

            const ctx = effectsCanvas.getContext('2d');
            ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

            const colorEffect = colorEffects.get(video.canvas);
            if (colorEffect) {
                colorEffect.update();
                colorEffect.draw();
            }
        });

        if (effectsActive) {
            animationId = requestAnimationFrame(animate);
        }
    }

    videos.forEach(setupEffectsForCanvas);

    const videoContainer = document.querySelector('.video-canvas-container');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('video-player')) {
                    const newVideo = videos[videos.length - 1];
                    if (newVideo) {
                        setupEffectsForCanvas(newVideo);
                    }
                }
            });
        });
    });

    observer.observe(videoContainer, { childList: true });

    colorButton.addEventListener('click', () => {
        effectsActive = !effectsActive;
        colorButton.textContent = effectsActive ? 'Oprire Culori' : 'Schimbare Culori';
        colorButton.classList.toggle('active', effectsActive);

        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initColorForCanvas(video.canvas));
            animate();
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                videos.forEach((video) => {
                    const effectsCanvas = effectsCanvases.get(video.canvas);
                    if (effectsCanvas) {
                        const ctx = effectsCanvas.getContext('2d');
                        ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
                    }
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        if (effectsActive) {
            videos.forEach((video) => {
                const effectsCanvas = effectsCanvases.get(video.canvas);
                if (effectsCanvas) {
                    resizeCanvas(video, effectsCanvas);
                }
            });
            videos.forEach(video => initColorForCanvas(video.canvas));
        }
    });
}
initializeColorEffects();