// Game variables
let scene, camera, renderer;
let stickMan;
let stickMan2; // Second player
let twoPlayerMode = false;
let ground;
let trampoline;
let cloudPlatform;
let satellite;
let moonSurface;
let marsSurface;
let alienPlanet;
let flatLand;
let starField;
let clouds = [];
let badGuys = [];
let dinosaurs = [];
let trampolines = []; // Array to track all trampolines
let keys = {};
let jumpPower = 0.3;
let baseJumpPower = 0.3;
let velocity = { x: 0, y: 0, z: 0 };
let velocity2 = { x: 0, y: 0, z: 0 }; // Second player velocity
let isGrounded = false;
let isGrounded2 = false; // Second player grounded
let wasGrounded = false; // Track previous grounded state for dog jump detection
let onCloudPlatform = false;
let onSatellite = false;
let onMoon = false;
let onMars = false;
let onAlienPlanet = false;
let onFlatLand = false;
let perfectJumpWindow = false;
let landingTime = 0;
let maxAltitude = 0;
let currentAltitude = 0;
let onTrampoline = false;
let rocket;
let inRocket = false;
let rocketStartTime = 0;
let rocketFlightDuration = 30000; // 30 seconds in milliseconds
let shop;
let houses = []; // Array of houses
let npcs = []; // Array of NPC stick men
let skyscraper; // 100 meter tall skyscraper
let stairSteps = []; // Array of stair collision boxes
let dogHouse; // Dog house
let dog; // Dog next to dog house
let actorHouse; // Actor's house with teleport
let insideActorHouse = false; // Whether player is inside actor's house
let roomWalls = []; // Walls of the interior room
let exitButton; // Button to exit the room
let coins = 100; // Starting coins
let trampolinePrice = 50;
let ownedTrampolines = 1; // Start with 1 trampoline
let placementMode = false; // Placement mode active
let ghostTrampoline = null; // Preview trampoline
let ghostPosition = { x: 0, z: 0 }; // Position of ghost trampoline
let hasBackflip = false; // Backflip upgrade purchased
let backflipPrice = 100;
let backflipMultiplier = 3; // Jump power multiplier from backflip
let isBackflipping = false; // Currently doing backflip animation
let backflipStartTime = 0; // When backflip started
let hasDoubleJump = false; // Double jump upgrade purchased
let doubleJumpPrice = 150;
let hasUsedDoubleJump = false; // Track if double jump has been used in current air time
let commandBarOpen = false; // Command bar is open
let foodHat = null; // Food hat object
let tickSpeed = 1; // Game tick speed multiplier (1 = normal, 0 = freeze, 2 = fast, 0.5 = slow)
let flyMode = false; // Fly mode enabled
let speedMultiplier = 1; // Movement speed multiplier
let dialogueActive = false; // Dialogue box is showing
let dialogueNPC = null; // Which NPC is talking
let aiPlayer = null; // AI-controlled player
let aiVelocity = { x: 0, y: 0, z: 0 }; // AI player velocity
let aiGrounded = false; // AI player grounded state
let aiDecisionTimer = 0; // Time until next AI decision
let aiCurrentAction = 'idle'; // Current AI action: idle, move, jump
let aiJumpTimer = 0; // Timer for automatic jumping every 10 seconds
let aiInstruction = ''; // Current instruction for AI to follow

// AI Brain - Neural network-like system
let aiBrain = {
    // Memory of past experiences
    memory: {
        maxAltitudeReached: 0,
        trampolinesUsed: 0,
        platformsReached: [],
        failedAttempts: 0,
        successfulJumps: 0,
        timeAlive: 0
    },

    // Current state sensors
    sensors: {
        altitude: 0,
        velocityY: 0,
        nearestTrampolineDistance: Infinity,
        nearestPlatformDistance: Infinity,
        isGrounded: false,
        timeSinceLastJump: 0
    },

    // Behavior weights (learning parameters)
    weights: {
        explorationDrive: 0.8,      // How much to explore randomly (VERY HIGH)
        trampolineSeekingDrive: 0.6, // How much to seek trampolines
        platformSeekingDrive: 0.4,   // How much to seek platforms
        riskTaking: 0.7,             // How willing to take risky jumps (HIGH)
        patience: 0.2                // How long to wait before acting (LOW - more impulsive)
    },

    // Emotional state (affects decision making)
    emotions: {
        confidence: 0.5,  // 0-1, increases with success
        frustration: 0,   // 0-1, increases with failures
        excitement: 0.5,  // 0-1, spikes with discoveries
        determination: 1  // 0-1, drive to reach goal
    },

    // Learning rate
    learningRate: 0.1,

    // Decision history for learning
    recentDecisions: []
};

// Audio context for sound effects
let audioContext;
let jumpSound;
let musicOscillators = [];
let musicGainNode;
let currentMusicMode = 'upbeat'; // 'upbeat', 'traditional', 'electronic', 'calm', 'off'
let musicInterval;
let lastFootstepTime = 0;
let lastFootstepTime2 = 0; // For player 2
let footstepInterval = 300; // Time between footsteps in milliseconds

// Perfect jump timing window (in milliseconds)
const PERFECT_JUMP_WINDOW = 200;

// Trampoline settings
const TRAMPOLINE_BOOST = 1.5; // Multiplier for jump power on trampoline
const TRAMPOLINE_POSITION = { x: 10, z: 10 };
const TRAMPOLINE_SIZE = 5;

// Cloud platform settings
const CLOUD_ALTITUDE = 300;
const CLOUD_PLATFORM_SIZE = 50;

// Satellite settings
const SATELLITE_ALTITUDE = 500;
const SATELLITE_PLATFORM_SIZE = 15;

// Moon settings
const MOON_ALTITUDE = 600;
const MOON_SURFACE_SIZE = 100;

// Mars settings
const MARS_ALTITUDE = 700;
const MARS_SURFACE_SIZE = 120;

// Alien planet settings
const ALIEN_ALTITUDE = 1000;
const ALIEN_PLANET_SIZE = 150;

// Rocket settings
const ROCKET_ALTITUDE = 1000;

// Flat land settings
const FLATLAND_ALTITUDE = 1600;
const FLATLAND_SIZE = 200;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 5, 0);

    // Create renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create ground
    createGround();

    // Create trampoline
    createTrampoline();

    // Create cloud platform
    createCloudPlatform();

    // Create satellite
    createSatellite();

    // Create star field
    createStarField();

    // Create moon surface
    createMoonSurface();

    // Create Mars surface
    createMarsSurface();

    // Create alien planet
    createAlienPlanet();

    // Create rocket
    createRocket();

    // Create flat land
    createFlatLand();

    // Create shop
    createShop();

    // Create houses at different locations
    houses.push(createHouse(20, 20));   // Northeast
    houses.push(createHouse(-25, 25));  // Northwest
    houses.push(createHouse(30, -30));  // Southeast
    houses.push(createHouse(-35, -10)); // West

    // Create NPCs inside each house (different colors)
    const blueNPC = createNPC(20, 0, 20 - 3, 0x0000ff);    // Blue NPC in house 1
    blueNPC.userData.hasDialogue = true; // This NPC can talk
    blueNPC.userData.question = "Hi nice day to jump :]";
    createNPC(-25, 0, 25 - 3, 0x00ff00);   // Green NPC in house 2
    createNPC(30, 0, -30 - 3, 0xff00ff);   // Purple NPC in house 3
    createNPC(-35, 0, -10 - 3, 0xffff00);  // Yellow NPC in house 4

    // Create skyscraper
    createSkyscraper();

    // Create dog house and dog
    createDogHouse();
    createDog();

    // Create actor's house and interior room
    createActorHouse();
    createInteriorRoom();

    // Create stick man
    createStickMan();

    // Initialize audio context
    initAudio();

    // Add event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);

    // Add command input listener
    const commandInput = document.getElementById('commandInput');
    commandInput.addEventListener('keydown', (event) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            const command = commandInput.value.trim();
            handleCommand(command);
            commandInput.value = '';
            closeCommandBar();
        } else if (event.code === 'Escape') {
            event.preventDefault();
            commandInput.value = '';
            closeCommandBar();
        }
    });

    // Add commands button listener
    const commandsButton = document.getElementById('commandsButton');
    const commandsList = document.getElementById('commandsList');
    commandsButton.addEventListener('click', () => {
        if (commandsList.style.display === 'none') {
            commandsList.style.display = 'block';
        } else {
            commandsList.style.display = 'none';
        }
    });

    // Add 2 player button listener
    const twoPlayerButton = document.getElementById('twoPlayerButton');
    twoPlayerButton.addEventListener('click', () => {
        if (!twoPlayerMode) {
            twoPlayerMode = true;
            createStickMan2();
            twoPlayerButton.textContent = '1 PLAYER';
            twoPlayerButton.style.color = '#00ff00';
            twoPlayerButton.style.borderColor = 'rgba(0, 255, 0, 0.7)';
            twoPlayerButton.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.4)';
        } else {
            twoPlayerMode = false;
            if (stickMan2) {
                scene.remove(stickMan2);
                stickMan2 = null;
            }
            twoPlayerButton.textContent = '2 PLAYER';
            twoPlayerButton.style.color = '#ff69b4';
            twoPlayerButton.style.borderColor = 'rgba(255, 105, 180, 0.7)';
            twoPlayerButton.style.boxShadow = '0 0 15px rgba(255, 105, 180, 0.4)';
        }
    });

    // Add music button listener
    const musicButton = document.getElementById('musicButton');
    musicButton.addEventListener('click', () => {
        stopMusic();

        if (currentMusicMode === 'upbeat') {
            currentMusicMode = 'traditional';
            musicButton.textContent = '🎵 STYLE 2';
            startTraditionalMusic();
        } else if (currentMusicMode === 'traditional') {
            currentMusicMode = 'electronic';
            musicButton.textContent = '🎵 STYLE 3';
            startElectronicMusic();
        } else if (currentMusicMode === 'electronic') {
            currentMusicMode = 'calm';
            musicButton.textContent = '🎵 STYLE 4';
            startCalmMusic();
        } else if (currentMusicMode === 'calm') {
            currentMusicMode = 'off';
            musicButton.textContent = '🔇 OFF';
        } else {
            currentMusicMode = 'upbeat';
            musicButton.textContent = '🎵 STYLE 1';
            startBackgroundMusic();
        }
    });

    // Add dialogue button listeners
    const yesButton = document.getElementById('yesButton');

    yesButton.addEventListener('click', () => {
        if (dialogueActive) {
            // Player clicked :]
            showCommandMessage(':]');
            dialogueActive = false;
            dialogueNPC = null;
            document.getElementById('dialogueBox').style.display = 'none';
        }
    });

    // Start animation loop
    animate();
}

// Initialize audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        startBackgroundMusic();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Stop all music
function stopMusic() {
    if (musicInterval) {
        clearTimeout(musicInterval);
        musicInterval = null;
    }
    musicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {}
    });
    musicOscillators = [];
}

// Start traditional music (Style 2)
function startTraditionalMusic() {
    if (!audioContext) return;

    // Create master gain node for music
    if (!musicGainNode) {
        musicGainNode = audioContext.createGain();
        musicGainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        musicGainNode.connect(audioContext.destination);
    }

    // Chinese pentatonic scale (C pentatonic: C, D, E, G, A)
    const melody = [
        { note: 523.25, duration: 0.4 },  // C5
        { note: 587.33, duration: 0.4 },  // D5
        { note: 659.25, duration: 0.6 },  // E5
        { note: 783.99, duration: 0.4 },  // G5
        { note: 880.00, duration: 0.8 },  // A5
        { note: 783.99, duration: 0.4 },  // G5
        { note: 659.25, duration: 0.4 },  // E5
        { note: 587.33, duration: 0.6 },  // D5
        { note: 523.25, duration: 0.4 },  // C5
        { note: 659.25, duration: 0.4 },  // E5
        { note: 783.99, duration: 0.8 },  // G5
        { note: 659.25, duration: 0.4 },  // E5
        { note: 587.33, duration: 0.4 },  // D5
        { note: 523.25, duration: 0.8 },  // C5
        { note: 587.33, duration: 0.4 },  // D5
        { note: 659.25, duration: 1.2 },  // E5
    ];

    // Lower harmony (octave down)
    const harmony = [261.63, 293.66, 329.63, 391.99]; // C4, D4, E4, G4
    let harmonyIndex = 0;

    let melodyIndex = 0;
    let nextMelodyTime = audioContext.currentTime;
    let nextHarmonyTime = audioContext.currentTime;

    function playNextNote() {
        const currentTime = audioContext.currentTime;

        // Play melody note
        if (currentTime >= nextMelodyTime) {
            const melodyNote = melody[melodyIndex];

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(musicGainNode);

            osc.frequency.setValueAtTime(melodyNote.note, currentTime);
            osc.type = 'sine'; // Pure sine for traditional sound

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.35, currentTime + 0.08);
            gainNode.gain.linearRampToValueAtTime(0.25, currentTime + melodyNote.duration * 0.7);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + melodyNote.duration);

            osc.start(currentTime);
            osc.stop(currentTime + melodyNote.duration);

            nextMelodyTime = currentTime + melodyNote.duration;
            melodyIndex = (melodyIndex + 1) % melody.length;
        }

        // Play harmony (slower, every 1.6 seconds)
        if (currentTime >= nextHarmonyTime) {
            const harmonyNote = harmony[harmonyIndex];

            const harmOsc = audioContext.createOscillator();
            const harmGain = audioContext.createGain();

            harmOsc.connect(harmGain);
            harmGain.connect(musicGainNode);

            harmOsc.frequency.setValueAtTime(harmonyNote, currentTime);
            harmOsc.type = 'sine';

            harmGain.gain.setValueAtTime(0, currentTime);
            harmGain.gain.linearRampToValueAtTime(0.2, currentTime + 0.1);
            harmGain.gain.linearRampToValueAtTime(0, currentTime + 1.4);

            harmOsc.start(currentTime);
            harmOsc.stop(currentTime + 1.4);

            nextHarmonyTime = currentTime + 1.6;
            harmonyIndex = (harmonyIndex + 1) % harmony.length;
        }

        // Schedule next note
        musicInterval = setTimeout(playNextNote, 50);
    }

    // Start playing
    playNextNote();
}

// Start calm background music
function startBackgroundMusic() {
    if (!audioContext) return;

    // Create master gain node for music
    musicGainNode = audioContext.createGain();
    musicGainNode.gain.setValueAtTime(0.12, audioContext.currentTime); // Slightly louder
    musicGainNode.connect(audioContext.destination);

    // Upbeat melody notes (frequency and duration in beats)
    const melody = [
        { note: 523.25, duration: 0.3 },  // C5
        { note: 587.33, duration: 0.3 },  // D5
        { note: 659.25, duration: 0.3 },  // E5
        { note: 783.99, duration: 0.6 },  // G5
        { note: 659.25, duration: 0.3 },  // E5
        { note: 587.33, duration: 0.3 },  // D5
        { note: 523.25, duration: 0.6 },  // C5
        { note: 587.33, duration: 0.3 },  // D5
        { note: 659.25, duration: 0.3 },  // E5
        { note: 523.25, duration: 0.3 },  // C5
        { note: 587.33, duration: 0.9 },  // D5
        { note: 523.25, duration: 0.3 },  // C5
        { note: 659.25, duration: 0.3 },  // E5
        { note: 783.99, duration: 0.3 },  // G5
        { note: 880.00, duration: 0.6 },  // A5
        { note: 783.99, duration: 0.6 },  // G5
    ];

    // Bass line (lower notes for depth)
    const bassNotes = [261.63, 293.66, 329.63, 392.00]; // C4, D4, E4, G4
    let bassIndex = 0;

    let melodyIndex = 0;
    let nextMelodyTime = audioContext.currentTime;
    let nextBassTime = audioContext.currentTime;

    function playNextNote() {
        const currentTime = audioContext.currentTime;

        // Play melody note
        if (currentTime >= nextMelodyTime) {
            const melodyNote = melody[melodyIndex];

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(musicGainNode);

            osc.frequency.setValueAtTime(melodyNote.note, currentTime);
            osc.type = 'triangle';

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + melodyNote.duration * 0.5);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + melodyNote.duration);

            osc.start(currentTime);
            osc.stop(currentTime + melodyNote.duration);

            nextMelodyTime = currentTime + melodyNote.duration;
            melodyIndex = (melodyIndex + 1) % melody.length;
        }

        // Play bass note (every 1.2 seconds for rhythm)
        if (currentTime >= nextBassTime) {
            const bassNote = bassNotes[bassIndex];

            const bassOsc = audioContext.createOscillator();
            const bassGain = audioContext.createGain();

            bassOsc.connect(bassGain);
            bassGain.connect(musicGainNode);

            bassOsc.frequency.setValueAtTime(bassNote, currentTime);
            bassOsc.type = 'sine';

            bassGain.gain.setValueAtTime(0, currentTime);
            bassGain.gain.linearRampToValueAtTime(0.25, currentTime + 0.05);
            bassGain.gain.linearRampToValueAtTime(0, currentTime + 1.0);

            bassOsc.start(currentTime);
            bassOsc.stop(currentTime + 1.0);

            nextBassTime = currentTime + 1.2;
            bassIndex = (bassIndex + 1) % bassNotes.length;
        }

        // Schedule next note
        musicInterval = setTimeout(playNextNote, 50);
    }

    // Start playing
    playNextNote();
}

// Start electronic music (Style 3)
function startElectronicMusic() {
    if (!audioContext) return;

    // Create master gain node for music
    if (!musicGainNode) {
        musicGainNode = audioContext.createGain();
        musicGainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        musicGainNode.connect(audioContext.destination);
    }

    // Fast electronic melody
    const melody = [
        { note: 440.00, duration: 0.2 },  // A4
        { note: 523.25, duration: 0.2 },  // C5
        { note: 659.25, duration: 0.2 },  // E5
        { note: 523.25, duration: 0.2 },  // C5
        { note: 587.33, duration: 0.2 },  // D5
        { note: 659.25, duration: 0.2 },  // E5
        { note: 783.99, duration: 0.2 },  // G5
        { note: 659.25, duration: 0.2 },  // E5
        { note: 880.00, duration: 0.4 },  // A5
        { note: 783.99, duration: 0.2 },  // G5
        { note: 659.25, duration: 0.2 },  // E5
        { note: 523.25, duration: 0.4 },  // C5
    ];

    // Pulsing bass
    const bassNotes = [220.00, 246.94, 261.63, 293.66]; // A3, B3, C4, D4
    let bassIndex = 0;

    let melodyIndex = 0;
    let nextMelodyTime = audioContext.currentTime;
    let nextBassTime = audioContext.currentTime;

    function playNextNote() {
        const currentTime = audioContext.currentTime;

        // Play melody note
        if (currentTime >= nextMelodyTime) {
            const melodyNote = melody[melodyIndex];

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(musicGainNode);

            osc.frequency.setValueAtTime(melodyNote.note, currentTime);
            osc.type = 'square'; // Square wave for electronic sound

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.02);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + melodyNote.duration);

            osc.start(currentTime);
            osc.stop(currentTime + melodyNote.duration);

            nextMelodyTime = currentTime + melodyNote.duration;
            melodyIndex = (melodyIndex + 1) % melody.length;
        }

        // Play bass (fast pulse)
        if (currentTime >= nextBassTime) {
            const bassNote = bassNotes[bassIndex];

            const bassOsc = audioContext.createOscillator();
            const bassGain = audioContext.createGain();

            bassOsc.connect(bassGain);
            bassGain.connect(musicGainNode);

            bassOsc.frequency.setValueAtTime(bassNote, currentTime);
            bassOsc.type = 'sawtooth';

            bassGain.gain.setValueAtTime(0, currentTime);
            bassGain.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
            bassGain.gain.linearRampToValueAtTime(0, currentTime + 0.3);

            bassOsc.start(currentTime);
            bassOsc.stop(currentTime + 0.3);

            nextBassTime = currentTime + 0.4;
            bassIndex = (bassIndex + 1) % bassNotes.length;
        }

        // Schedule next note
        musicInterval = setTimeout(playNextNote, 50);
    }

    // Start playing
    playNextNote();
}

// Start calm music (Style 4)
function startCalmMusic() {
    if (!audioContext) return;

    // Create master gain node for music
    if (!musicGainNode) {
        musicGainNode = audioContext.createGain();
        musicGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        musicGainNode.connect(audioContext.destination);
    }

    // Slow, peaceful melody
    const melody = [
        { note: 392.00, duration: 1.0 },  // G4
        { note: 523.25, duration: 1.0 },  // C5
        { note: 659.25, duration: 1.5 },  // E5
        { note: 587.33, duration: 1.0 },  // D5
        { note: 523.25, duration: 2.0 },  // C5
        { note: 440.00, duration: 1.0 },  // A4
        { note: 493.88, duration: 1.0 },  // B4
        { note: 523.25, duration: 2.5 },  // C5
    ];

    let melodyIndex = 0;
    let nextMelodyTime = audioContext.currentTime;

    function playNextNote() {
        const currentTime = audioContext.currentTime;

        // Play melody note
        if (currentTime >= nextMelodyTime) {
            const melodyNote = melody[melodyIndex];

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(musicGainNode);

            osc.frequency.setValueAtTime(melodyNote.note, currentTime);
            osc.type = 'sine';

            // Very smooth envelope
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.3);
            gainNode.gain.linearRampToValueAtTime(0.35, currentTime + melodyNote.duration * 0.8);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + melodyNote.duration);

            osc.start(currentTime);
            osc.stop(currentTime + melodyNote.duration);

            nextMelodyTime = currentTime + melodyNote.duration;
            melodyIndex = (melodyIndex + 1) % melody.length;
        }

        // Schedule next note
        musicInterval = setTimeout(playNextNote, 50);
    }

    // Start playing
    playNextNote();
}

// Play jump sound
function playJumpSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Jump sound parameters
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Play footstep sound
function playFootstep() {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;

    // Low thump for footstep
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start low and drop quickly
    osc.frequency.setValueAtTime(150, currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.15, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    osc.type = 'sine';
    osc.start(currentTime);
    osc.stop(currentTime + 0.1);
}

// Play landing sound
function playLandSound() {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;

    // Deep thud for landing
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Lower and heavier than footstep
    osc.frequency.setValueAtTime(120, currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.25, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

    osc.type = 'sine';
    osc.start(currentTime);
    osc.stop(currentTime + 0.15);
}

// Create landing effect (dust particles)
function createLandingEffect(position) {
    const particleCount = 8;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.2, 4, 4);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Position at landing point
        particle.position.copy(position);
        particle.position.y = position.y + 0.2;

        // Random direction outward
        const angle = (i / particleCount) * Math.PI * 2;
        particle.velocity = {
            x: Math.cos(angle) * 0.15,
            y: 0.2,
            z: Math.sin(angle) * 0.15
        };

        scene.add(particle);
        particles.push(particle);
    }

    // Animate particles
    let frame = 0;
    const maxFrames = 30;

    function animateParticles() {
        frame++;

        particles.forEach(particle => {
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;

            // Gravity
            particle.velocity.y -= 0.02;

            // Fade out
            particle.material.opacity = 0.8 * (1 - frame / maxFrames);
        });

        if (frame < maxFrames) {
            requestAnimationFrame(animateParticles);
        } else {
            // Remove particles
            particles.forEach(particle => {
                scene.remove(particle);
            });
        }
    }

    animateParticles();
}

// Play cha-ching sound (purchase/coin sound)
function playChaChing() {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;

    // First note (high)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);

    osc1.frequency.setValueAtTime(800, currentTime);
    gain1.gain.setValueAtTime(0.3, currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    osc1.type = 'sine';
    osc1.start(currentTime);
    osc1.stop(currentTime + 0.1);

    // Second note (higher)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc2.frequency.setValueAtTime(1200, currentTime + 0.05);
    gain2.gain.setValueAtTime(0.3, currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

    osc2.type = 'sine';
    osc2.start(currentTime + 0.05);
    osc2.stop(currentTime + 0.2);

    // Third note (highest - the "ching")
    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    osc3.connect(gain3);
    gain3.connect(audioContext.destination);

    osc3.frequency.setValueAtTime(1600, currentTime + 0.1);
    gain3.gain.setValueAtTime(0.25, currentTime + 0.1);
    gain3.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);

    osc3.type = 'triangle';
    osc3.start(currentTime + 0.1);
    osc3.stop(currentTime + 0.35);
}

// Create stick man character
function createStickMan() {
    stickMan = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const jointMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 5.5;
    head.castShadow = true;
    stickMan.add(head);

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 3.75;
    torso.castShadow = true;
    stickMan.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.8, 4.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    stickMan.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.8, 4.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    stickMan.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);

    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 1.25, 0);
    leftLeg.castShadow = true;
    stickMan.add(leftLeg);
    stickMan.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 1.25, 0);
    rightLeg.castShadow = true;
    stickMan.add(rightLeg);
    stickMan.rightLeg = rightLeg;

    // Joints (for visual detail)
    const jointGeometry = new THREE.SphereGeometry(0.12, 8, 8);

    const leftShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    leftShoulder.position.set(-0.5, 4.8, 0);
    stickMan.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    rightShoulder.position.set(0.5, 4.8, 0);
    stickMan.add(rightShoulder);

    const leftHip = new THREE.Mesh(jointGeometry, jointMaterial);
    leftHip.position.set(-0.3, 2.5, 0);
    stickMan.add(leftHip);

    const rightHip = new THREE.Mesh(jointGeometry, jointMaterial);
    rightHip.position.set(0.3, 2.5, 0);
    stickMan.add(rightHip);

    // Position stick man
    stickMan.position.set(0, 0, 0);
    scene.add(stickMan);
}

// Create second stick man (player 2 - blue)
function createStickMan2() {
    stickMan2 = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // Blue
    const jointMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff }); // Cyan

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 5.5;
    head.castShadow = true;
    stickMan2.add(head);

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 3.75;
    torso.castShadow = true;
    stickMan2.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.8, 4.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    stickMan2.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.8, 4.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    stickMan2.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);

    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 1.25, 0);
    leftLeg.castShadow = true;
    stickMan2.add(leftLeg);
    stickMan2.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 1.25, 0);
    rightLeg.castShadow = true;
    stickMan2.add(rightLeg);
    stickMan2.rightLeg = rightLeg;

    // Joints (for visual detail)
    const jointGeometry = new THREE.SphereGeometry(0.12, 8, 8);

    const leftShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    leftShoulder.position.set(-0.5, 4.8, 0);
    stickMan2.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    rightShoulder.position.set(0.5, 4.8, 0);
    stickMan2.add(rightShoulder);

    const leftHip = new THREE.Mesh(jointGeometry, jointMaterial);
    leftHip.position.set(-0.3, 2.5, 0);
    stickMan2.add(leftHip);

    const rightHip = new THREE.Mesh(jointGeometry, jointMaterial);
    rightHip.position.set(0.3, 2.5, 0);
    stickMan2.add(rightHip);

    // Position stick man 2 to the side
    stickMan2.position.set(5, 0, 0);
    scene.add(stickMan2);
}

// Create ground plane
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x3a9d3a,
        flatShading: true
    });

    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;

    // Add some random height variation to ground
    const vertices = ground.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] += Math.random() * 0.3;
    }
    ground.geometry.attributes.position.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    scene.add(ground);

    // Add grid for depth perception
    const gridHelper = new THREE.GridHelper(200, 50, 0x000000, 0x555555);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

// Create trampoline
function createTrampoline() {
    trampoline = new THREE.Group();

    // Frame (outer circle)
    const frameGeometry = new THREE.TorusGeometry(TRAMPOLINE_SIZE / 2, 0.2, 16, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.rotation.x = Math.PI / 2;
    frame.castShadow = true;
    trampoline.add(frame);

    // Jumping surface (circular mesh pattern)
    const surfaceGeometry = new THREE.CylinderGeometry(
        TRAMPOLINE_SIZE / 2 - 0.3,
        TRAMPOLINE_SIZE / 2 - 0.3,
        0.1,
        32
    );
    const surfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        emissive: 0x000000,
        wireframe: true,
        wireframeLinewidth: 2
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = 0;
    trampoline.add(surface);

    // Solid surface for visual effect (slightly transparent blue)
    const solidSurfaceGeometry = new THREE.CircleGeometry(TRAMPOLINE_SIZE / 2 - 0.3, 32);
    const solidSurfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const solidSurface = new THREE.Mesh(solidSurfaceGeometry, solidSurfaceMaterial);
    solidSurface.rotation.x = -Math.PI / 2;
    solidSurface.position.y = 0.05;
    trampoline.add(solidSurface);

    // Springs around the edge
    const springCount = 16;
    const springGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const springMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

    for (let i = 0; i < springCount; i++) {
        const angle = (i / springCount) * Math.PI * 2;
        const spring = new THREE.Mesh(springGeometry, springMaterial);
        spring.position.x = Math.cos(angle) * (TRAMPOLINE_SIZE / 2);
        spring.position.z = Math.sin(angle) * (TRAMPOLINE_SIZE / 2);
        spring.position.y = -0.25;
        spring.castShadow = true;
        trampoline.add(spring);
    }

    // Position the trampoline
    trampoline.position.set(TRAMPOLINE_POSITION.x, 0.05, TRAMPOLINE_POSITION.z);
    trampoline.receiveShadow = true;

    // Store the surface for animation
    trampoline.surface = surface;
    trampoline.solidSurface = solidSurface;

    scene.add(trampoline);
    trampolines.push(trampoline); // Add to trampolines array
}

// Create cloud platform
function createCloudPlatform() {
    cloudPlatform = new THREE.Group();

    // Main platform surface (invisible collision plane)
    const platformGeometry = new THREE.PlaneGeometry(CLOUD_PLATFORM_SIZE, CLOUD_PLATFORM_SIZE);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    cloudPlatform.add(platform);

    // Create fluffy cloud shapes scattered across the platform
    const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        flatShading: true
    });

    // Create multiple cloud puffs in a cluster pattern
    for (let i = 0; i < 40; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

        // Random position within platform area
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (CLOUD_PLATFORM_SIZE / 2 - 5);
        cloud.position.x = Math.cos(angle) * distance;
        cloud.position.z = Math.sin(angle) * distance;
        cloud.position.y = Math.random() * 3 - 1;

        // Random size for variety
        const scale = 2 + Math.random() * 3;
        cloud.scale.set(scale, scale * 0.6, scale);

        cloudPlatform.add(cloud);
        clouds.push(cloud);
    }

    // Add some extra large cloud puffs for visual interest
    for (let i = 0; i < 8; i++) {
        const bigCloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        const angle = (i / 8) * Math.PI * 2;
        const distance = CLOUD_PLATFORM_SIZE / 3;
        bigCloud.position.x = Math.cos(angle) * distance;
        bigCloud.position.z = Math.sin(angle) * distance;
        bigCloud.position.y = Math.random() * 2;

        const scale = 5 + Math.random() * 3;
        bigCloud.scale.set(scale, scale * 0.5, scale);

        cloudPlatform.add(bigCloud);
        clouds.push(bigCloud);
    }

    // Position the cloud platform at altitude 300
    cloudPlatform.position.y = CLOUD_ALTITUDE;
    cloudPlatform.visible = false; // Start invisible, will show when player reaches altitude 300
    scene.add(cloudPlatform);
}

// Create satellite
function createSatellite() {
    satellite = new THREE.Group();

    // Main satellite body (rectangular box)
    const bodyGeometry = new THREE.BoxGeometry(6, 4, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    satellite.add(body);

    // Add details to body (panels and sections)
    const detailMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const detail1 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 3.8), detailMaterial);
    detail1.position.y = 2.1;
    satellite.add(detail1);

    const detail2 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 3.8), detailMaterial);
    detail2.position.y = -2.1;
    satellite.add(detail2);

    // Solar panels (left side)
    const panelGeometry = new THREE.BoxGeometry(8, 0.1, 6);
    const panelMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a3d5c,
        emissive: 0x0a1d2c,
        shininess: 100
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.x = -7;
    leftPanel.castShadow = true;
    satellite.add(leftPanel);

    // Solar panel grid lines (left)
    const gridMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    for (let i = -3; i <= 3; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 0.1), gridMaterial);
        line.position.set(-7, 0, i);
        satellite.add(line);
    }
    for (let i = -4; i <= 4; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 6), gridMaterial);
        line.position.set(-7 + i * 2, 0, 0);
        satellite.add(line);
    }

    // Solar panels (right side)
    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.x = 7;
    rightPanel.castShadow = true;
    satellite.add(rightPanel);

    // Solar panel grid lines (right)
    for (let i = -3; i <= 3; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 0.1), gridMaterial);
        line.position.set(7, 0, i);
        satellite.add(line);
    }
    for (let i = -4; i <= 4; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 6), gridMaterial);
        line.position.set(7 + i * 2, 0, 0);
        satellite.add(line);
    }

    // Communication dish
    const dishGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
    const dishMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        metalness: 0.9
    });
    const dish = new THREE.Mesh(dishGeometry, dishMaterial);
    dish.position.set(0, 3, 0);
    dish.rotation.x = Math.PI / 6;
    dish.castShadow = true;
    satellite.add(dish);

    // Dish support arm
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(0, 2.3, 0);
    satellite.add(arm);

    // Antennas
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa00 });

    const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna1.position.set(-2, 3, 1.5);
    satellite.add(antenna1);

    const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna2.position.set(2, 3, 1.5);
    satellite.add(antenna2);

    // Antenna tips
    const tipGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const tipMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0x880000
    });

    const tip1 = new THREE.Mesh(tipGeometry, tipMaterial);
    tip1.position.set(-2, 4, 1.5);
    satellite.add(tip1);

    const tip2 = new THREE.Mesh(tipGeometry, tipMaterial);
    tip2.position.set(2, 4, 1.5);
    satellite.add(tip2);

    // Landing platform (invisible collision surface on top)
    const platformGeometry = new THREE.BoxGeometry(SATELLITE_PLATFORM_SIZE, 0.5, SATELLITE_PLATFORM_SIZE);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.8
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 2.25;
    satellite.add(platform);

    // Position the satellite
    satellite.position.y = SATELLITE_ALTITUDE;
    satellite.visible = false; // Start invisible, will show when player reaches altitude 500

    // Store rotation reference for animation
    satellite.rotationSpeed = 0.001;

    scene.add(satellite);
}

// Create star field
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    // Create 2000 stars scattered in a sphere around the scene
    for (let i = 0; i < 2000; i++) {
        // Random position in a large sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 800 + Math.random() * 200;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create moon surface
function createMoonSurface() {
    moonSurface = new THREE.Group();

    // Create moon terrain with height variations
    const moonGeometry = new THREE.PlaneGeometry(
        MOON_SURFACE_SIZE,
        MOON_SURFACE_SIZE,
        80,
        80
    );

    // Add crater-like terrain
    const vertices = moonGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];

        // Create crater patterns using sine waves and randomness
        const crater1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2;
        const crater2 = Math.sin(x * 0.5 + 5) * Math.cos(z * 0.5 + 3) * 1.5;
        const roughness = (Math.random() - 0.5) * 1;

        vertices[i + 2] = crater1 + crater2 + roughness;
    }

    moonGeometry.attributes.position.needsUpdate = true;
    moonGeometry.computeVertexNormals();

    const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0x9d9d9d,
        flatShading: true,
        shininess: 5
    });

    const moonTerrain = new THREE.Mesh(moonGeometry, moonMaterial);
    moonTerrain.rotation.x = -Math.PI / 2;
    moonTerrain.receiveShadow = true;
    moonSurface.add(moonTerrain);

    // Add some larger crater features
    for (let i = 0; i < 10; i++) {
        const craterRadius = 3 + Math.random() * 5;
        const craterDepth = 0.5 + Math.random() * 1;

        const craterGeometry = new THREE.CylinderGeometry(
            craterRadius,
            craterRadius * 0.7,
            craterDepth,
            16
        );
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x7a7a7a,
            flatShading: true
        });

        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (MOON_SURFACE_SIZE / 2 - 10);

        crater.position.x = Math.cos(angle) * distance;
        crater.position.z = Math.sin(angle) * distance;
        crater.position.y = -craterDepth / 2;
        crater.receiveShadow = true;
        crater.castShadow = true;

        moonSurface.add(crater);
    }

    // Add some moon rocks scattered around
    for (let i = 0; i < 30; i++) {
        const rockSize = 0.3 + Math.random() * 1;
        const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            flatShading: true
        });

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (MOON_SURFACE_SIZE / 2 - 5);

        rock.position.x = Math.cos(angle) * distance;
        rock.position.z = Math.sin(angle) * distance;
        rock.position.y = rockSize / 2;

        rock.rotation.x = Math.random() * Math.PI;
        rock.rotation.y = Math.random() * Math.PI;
        rock.rotation.z = Math.random() * Math.PI;

        rock.castShadow = true;
        rock.receiveShadow = true;

        moonSurface.add(rock);
    }

    // Position moon surface
    moonSurface.position.y = MOON_ALTITUDE;
    moonSurface.visible = false; // Start invisible

    scene.add(moonSurface);
}

// Create Mars surface
function createMarsSurface() {
    marsSurface = new THREE.Group();

    // Create Mars terrain with height variations
    const marsGeometry = new THREE.PlaneGeometry(
        MARS_SURFACE_SIZE,
        MARS_SURFACE_SIZE,
        100,
        100
    );

    // Add rocky Martian terrain
    const vertices = marsGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];

        // Create mountainous terrain with valleys
        const mountain1 = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 4;
        const mountain2 = Math.sin(x * 0.15 + 3) * Math.cos(z * 0.15 + 2) * 3;
        const hills = Math.sin(x * 0.4) * Math.sin(z * 0.4) * 1.5;
        const roughness = (Math.random() - 0.5) * 1.5;

        vertices[i + 2] = mountain1 + mountain2 + hills + roughness;
    }

    marsGeometry.attributes.position.needsUpdate = true;
    marsGeometry.computeVertexNormals();

    const marsMaterial = new THREE.MeshPhongMaterial({
        color: 0xcd5c5c,
        flatShading: true,
        shininess: 3
    });

    const marsTerrain = new THREE.Mesh(marsGeometry, marsMaterial);
    marsTerrain.rotation.x = -Math.PI / 2;
    marsTerrain.receiveShadow = true;
    marsSurface.add(marsTerrain);

    // Add some darker reddish-brown patches (different terrain types)
    for (let i = 0; i < 15; i++) {
        const patchRadius = 4 + Math.random() * 6;
        const patchGeometry = new THREE.CircleGeometry(patchRadius, 16);
        const patchMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            flatShading: true
        });

        const patch = new THREE.Mesh(patchGeometry, patchMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (MARS_SURFACE_SIZE / 2 - 10);

        patch.position.x = Math.cos(angle) * distance;
        patch.position.z = Math.sin(angle) * distance;
        patch.position.y = 0.05;
        patch.rotation.x = -Math.PI / 2;

        marsSurface.add(patch);
    }

    // Add large reddish boulders
    for (let i = 0; i < 40; i++) {
        const boulderSize = 0.5 + Math.random() * 2;
        const boulderGeometry = new THREE.IcosahedronGeometry(boulderSize, 0);
        const boulderMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0xa0522d : 0xb8860b,
            flatShading: true
        });

        const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (MARS_SURFACE_SIZE / 2 - 5);

        boulder.position.x = Math.cos(angle) * distance;
        boulder.position.z = Math.sin(angle) * distance;
        boulder.position.y = boulderSize / 2;

        boulder.rotation.x = Math.random() * Math.PI;
        boulder.rotation.y = Math.random() * Math.PI;
        boulder.rotation.z = Math.random() * Math.PI;

        boulder.castShadow = true;
        boulder.receiveShadow = true;

        marsSurface.add(boulder);
    }

    // Add some smaller red rocks scattered around
    for (let i = 0; i < 60; i++) {
        const rockSize = 0.2 + Math.random() * 0.5;
        const rockGeometry = new THREE.TetrahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0xc04000,
            flatShading: true
        });

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (MARS_SURFACE_SIZE / 2 - 3);

        rock.position.x = Math.cos(angle) * distance;
        rock.position.z = Math.sin(angle) * distance;
        rock.position.y = rockSize / 2;

        rock.rotation.x = Math.random() * Math.PI;
        rock.rotation.y = Math.random() * Math.PI;
        rock.rotation.z = Math.random() * Math.PI;

        rock.castShadow = true;
        rock.receiveShadow = true;

        marsSurface.add(rock);
    }

    // Position Mars surface
    marsSurface.position.y = MARS_ALTITUDE;
    marsSurface.visible = false; // Start invisible

    scene.add(marsSurface);
}

// Create alien planet
function createAlienPlanet() {
    alienPlanet = new THREE.Group();

    // Create alien terrain with exotic colors and strange patterns
    const alienGeometry = new THREE.PlaneGeometry(
        ALIEN_PLANET_SIZE,
        ALIEN_PLANET_SIZE,
        120,
        120
    );

    // Add bizarre alien terrain with unusual formations
    const vertices = alienGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];

        // Create weird alien landscape with multiple wave patterns
        const wave1 = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 5;
        const wave2 = Math.cos(x * 0.35 + 7) * Math.sin(z * 0.35 + 4) * 3;
        const spikes = Math.sin(x * 0.8) * Math.sin(z * 0.8) * 2;
        const roughness = (Math.random() - 0.5) * 2;

        vertices[i + 2] = wave1 + wave2 + spikes + roughness;
    }

    alienGeometry.attributes.position.needsUpdate = true;
    alienGeometry.computeVertexNormals();

    const alienMaterial = new THREE.MeshPhongMaterial({
        color: 0x9b59b6, // Purple alien terrain
        flatShading: true,
        shininess: 10,
        emissive: 0x4a0e4e
    });

    const alienTerrain = new THREE.Mesh(alienGeometry, alienMaterial);
    alienTerrain.rotation.x = -Math.PI / 2;
    alienTerrain.receiveShadow = true;
    alienPlanet.add(alienTerrain);

    // Add glowing green crystals scattered around
    for (let i = 0; i < 30; i++) {
        const crystalHeight = 2 + Math.random() * 4;
        const crystalGeometry = new THREE.ConeGeometry(0.5, crystalHeight, 6);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00aa44,
            shininess: 100
        });

        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (ALIEN_PLANET_SIZE / 2 - 10);

        crystal.position.x = Math.cos(angle) * distance;
        crystal.position.z = Math.sin(angle) * distance;
        crystal.position.y = crystalHeight / 2;

        crystal.rotation.x = (Math.random() - 0.5) * 0.3;
        crystal.rotation.z = (Math.random() - 0.5) * 0.3;

        crystal.castShadow = true;
        crystal.receiveShadow = true;

        alienPlanet.add(crystal);
    }

    // Add cyan glowing pools
    for (let i = 0; i < 12; i++) {
        const poolRadius = 2 + Math.random() * 4;
        const poolGeometry = new THREE.CircleGeometry(poolRadius, 20);
        const poolMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x0088aa,
            transparent: true,
            opacity: 0.8
        });

        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (ALIEN_PLANET_SIZE / 2 - 15);

        pool.position.x = Math.cos(angle) * distance;
        pool.position.z = Math.sin(angle) * distance;
        pool.position.y = 0.1;
        pool.rotation.x = -Math.PI / 2;

        alienPlanet.add(pool);
    }

    // Add strange alien rocks (pink and orange)
    for (let i = 0; i < 50; i++) {
        const rockSize = 0.3 + Math.random() * 1.5;
        const rockGeometry = new THREE.OctahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0xff6b9d : 0xff8c42,
            flatShading: true,
            emissive: Math.random() > 0.5 ? 0x661135 : 0x663311
        });

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (ALIEN_PLANET_SIZE / 2 - 5);

        rock.position.x = Math.cos(angle) * distance;
        rock.position.z = Math.sin(angle) * distance;
        rock.position.y = rockSize / 2;

        rock.rotation.x = Math.random() * Math.PI;
        rock.rotation.y = Math.random() * Math.PI;
        rock.rotation.z = Math.random() * Math.PI;

        rock.castShadow = true;
        rock.receiveShadow = true;

        alienPlanet.add(rock);
    }

    // Create bad guy enemies
    for (let i = 0; i < 8; i++) {
        const badGuy = new THREE.Group();

        // Body (dark red sphere)
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b0000,
            emissive: 0x440000
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        badGuy.add(body);

        // Glowing eyes (red)
        const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.3, 0.8);
        badGuy.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.3, 0.8);
        badGuy.add(rightEye);

        // Spiky protrusions
        const spikeGeometry = new THREE.ConeGeometry(0.2, 0.8, 6);
        const spikeMaterial = new THREE.MeshPhongMaterial({
            color: 0x330000,
            emissive: 0x220000
        });

        for (let j = 0; j < 6; j++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            const spikeAngle = (j / 6) * Math.PI * 2;
            spike.position.x = Math.cos(spikeAngle) * 0.9;
            spike.position.z = Math.sin(spikeAngle) * 0.9;
            spike.rotation.z = -spikeAngle - Math.PI / 2;
            badGuy.add(spike);
        }

        // Position bad guy on alien planet
        const angle = (i / 8) * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        badGuy.position.x = Math.cos(angle) * distance;
        badGuy.position.z = Math.sin(angle) * distance;
        badGuy.position.y = 1;

        // Store movement properties
        badGuy.userData.angle = angle;
        badGuy.userData.distance = distance;
        badGuy.userData.speed = 0.01 + Math.random() * 0.02;
        badGuy.userData.direction = Math.random() > 0.5 ? 1 : -1;

        badGuy.castShadow = true;
        alienPlanet.add(badGuy);
        badGuys.push(badGuy);
    }

    // Position alien planet
    alienPlanet.position.y = ALIEN_ALTITUDE;
    alienPlanet.visible = false; // Start invisible

    scene.add(alienPlanet);
}

// Create rocket
function createRocket() {
    rocket = new THREE.Group();

    // Main body (white/silver cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 80
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    rocket.add(body);

    // Red stripes on body
    for (let i = 0; i < 3; i++) {
        const stripeGeometry = new THREE.CylinderGeometry(1.52, 1.52, 0.5, 16);
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = -2 + i * 2;
        rocket.add(stripe);
    }

    // Nose cone (top)
    const noseGeometry = new THREE.ConeGeometry(1.5, 3, 16);
    const noseMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 100
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.y = 5.5;
    nose.castShadow = true;
    rocket.add(nose);

    // Windows (portholes)
    const windowGeometry = new THREE.CircleGeometry(0.3, 16);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        emissive: 0x4488ff,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < 4; i++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        const angle = (i / 4) * Math.PI * 2;
        window.position.x = Math.cos(angle) * 1.51;
        window.position.z = Math.sin(angle) * 1.51;
        window.position.y = 2;
        window.rotation.y = -angle;
        rocket.add(window);
    }

    // Fins (4 fins at the bottom)
    const finGeometry = new THREE.BoxGeometry(0.2, 3, 2);
    const finMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 50
    });

    for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        const angle = (i / 4) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 1.5;
        fin.position.z = Math.sin(angle) * 1.5;
        fin.position.y = -3;
        fin.rotation.y = angle;
        fin.castShadow = true;
        rocket.add(fin);
    }

    // Thruster flames (animated)
    const flameGeometry = new THREE.ConeGeometry(1.2, 2, 8);
    const flameMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6600,
        emissive: 0xff4400,
        transparent: true,
        opacity: 0.8
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = -5.5;
    flame.rotation.x = Math.PI;
    rocket.add(flame);
    rocket.flame = flame;

    // Position rocket at altitude 1000
    rocket.position.y = ROCKET_ALTITUDE;
    rocket.visible = false; // Start invisible

    scene.add(rocket);
}

// Create flat land with dinosaurs
function createFlatLand() {
    flatLand = new THREE.Group();

    // Create flat grass terrain
    const flatGeometry = new THREE.PlaneGeometry(FLATLAND_SIZE, FLATLAND_SIZE, 50, 50);
    const flatMaterial = new THREE.MeshPhongMaterial({
        color: 0x90EE90, // Light green grass
        flatShading: true,
        shininess: 5
    });

    const flatTerrain = new THREE.Mesh(flatGeometry, flatMaterial);
    flatTerrain.rotation.x = -Math.PI / 2;
    flatTerrain.receiveShadow = true;
    flatLand.add(flatTerrain);

    // Add some grass patches
    for (let i = 0; i < 30; i++) {
        const patchRadius = 2 + Math.random() * 4;
        const patchGeometry = new THREE.CircleGeometry(patchRadius, 16);
        const patchMaterial = new THREE.MeshPhongMaterial({
            color: 0x228B22, // Darker green
            flatShading: true
        });

        const patch = new THREE.Mesh(patchGeometry, patchMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (FLATLAND_SIZE / 2 - 10);

        patch.position.x = Math.cos(angle) * distance;
        patch.position.z = Math.sin(angle) * distance;
        patch.position.y = 0.02;
        patch.rotation.x = -Math.PI / 2;

        flatLand.add(patch);
    }

    // Create dinosaurs (T-Rex style)
    for (let i = 0; i < 6; i++) {
        const dino = new THREE.Group();

        // Body (large green sphere/oval)
        const bodyGeometry = new THREE.SphereGeometry(2, 16, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x6B8E23, // Olive green
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 1.2, 1.5); // Make it more oval
        body.position.y = 2;
        body.castShadow = true;
        dino.add(body);

        // Head
        const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 2);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x556B2F, // Darker green
            flatShading: true
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 3, 2);
        head.castShadow = true;
        dino.add(head);

        // Snout
        const snoutGeometry = new THREE.BoxGeometry(1, 0.8, 1.5);
        const snoutMaterial = new THREE.MeshPhongMaterial({
            color: 0x556B2F,
            flatShading: true
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(0, 2.7, 3);
        snout.castShadow = true;
        dino.add(snout);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFF00, // Yellow eyes
            emissive: 0x888800
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.5, 3.5, 2.8);
        dino.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 3.5, 2.8);
        dino.add(rightEye);

        // Legs (large back legs)
        const backLegGeometry = new THREE.CylinderGeometry(0.5, 0.6, 3, 8);
        const legMaterial = new THREE.MeshPhongMaterial({
            color: 0x556B2F,
            flatShading: true
        });

        const leftBackLeg = new THREE.Mesh(backLegGeometry, legMaterial);
        leftBackLeg.position.set(-1, 1.5, 0);
        leftBackLeg.castShadow = true;
        dino.add(leftBackLeg);

        const rightBackLeg = new THREE.Mesh(backLegGeometry, legMaterial);
        rightBackLeg.position.set(1, 1.5, 0);
        rightBackLeg.castShadow = true;
        dino.add(rightBackLeg);

        // Small front arms
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 8);
        const leftArm = new THREE.Mesh(armGeometry, legMaterial);
        leftArm.position.set(-0.8, 2.5, 1.5);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        dino.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, legMaterial);
        rightArm.position.set(0.8, 2.5, 1.5);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        dino.add(rightArm);

        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.8, 4, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 2, -2);
        tail.rotation.x = Math.PI / 2;
        tail.castShadow = true;
        dino.add(tail);

        // Position dino on flat land
        const angle = (i / 6) * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        dino.position.x = Math.cos(angle) * distance;
        dino.position.z = Math.sin(angle) * distance;
        dino.position.y = 0;

        // Store movement properties
        dino.userData.angle = angle;
        dino.userData.distance = distance;
        dino.userData.speed = 0.005 + Math.random() * 0.01;
        dino.userData.direction = Math.random() > 0.5 ? 1 : -1;

        dino.castShadow = true;
        flatLand.add(dino);
        dinosaurs.push(dino);
    }

    // Position flat land at altitude 1600
    flatLand.position.y = FLATLAND_ALTITUDE;
    flatLand.visible = false; // Start invisible

    scene.add(flatLand);
}

// Create shop
function createShop() {
    shop = new THREE.Group();

    // Shop building base
    const baseGeometry = new THREE.BoxGeometry(12, 8, 10);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513,
        flatShading: true
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 4;
    base.castShadow = true;
    base.receiveShadow = true;
    shop.add(base);

    // Roof (pyramid shape)
    const roofGeometry = new THREE.ConeGeometry(8.5, 4, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    shop.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(2.5, 4, 0.2);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x654321
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, 5.1);
    door.castShadow = true;
    shop.add(door);

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 100
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.8, 2, 5.2);
    shop.add(handle);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        emissive: 0x4488aa,
        transparent: true,
        opacity: 0.7
    });

    // Left window
    const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    leftWindow.position.set(-3.5, 5, 5.05);
    shop.add(leftWindow);

    // Right window
    const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    rightWindow.position.set(3.5, 5, 5.05);
    shop.add(rightWindow);

    // Sign above door
    const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
    const signMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        emissive: 0x886600
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 5.5, 5.1);
    shop.add(sign);

    // Add "SHOP" text using simple boxes
    const letterMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000
    });
    const letterGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.1);

    // S
    const s1 = new THREE.Mesh(letterGeometry, letterMaterial);
    s1.position.set(-1.5, 5.5, 5.2);
    shop.add(s1);

    // H
    const h1 = new THREE.Mesh(letterGeometry, letterMaterial);
    h1.position.set(-0.5, 5.5, 5.2);
    shop.add(h1);

    // O
    const o1 = new THREE.Mesh(letterGeometry, letterMaterial);
    o1.position.set(0.5, 5.5, 5.2);
    shop.add(o1);

    // P
    const p1 = new THREE.Mesh(letterGeometry, letterMaterial);
    p1.position.set(1.5, 5.5, 5.2);
    shop.add(p1);

    // Display trampoline for sale
    const displayTrampolineGeometry = new THREE.TorusGeometry(1.5, 0.15, 12, 24);
    const displayTrampolineMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        emissive: 0x003388
    });
    const displayTrampoline = new THREE.Mesh(displayTrampolineGeometry, displayTrampolineMaterial);
    displayTrampoline.position.set(6, 2, 0);
    displayTrampoline.rotation.x = Math.PI / 2;
    shop.add(displayTrampoline);

    // Position shop at ground level
    shop.position.set(-20, 0, -20);
    scene.add(shop);
}

// Create house with couch at specified position
function createHouse(x, z) {
    const house = new THREE.Group();

    // Floor
    const floorGeometry = new THREE.BoxGeometry(15, 0.2, 15);
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b7355
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0.1;
    floor.receiveShadow = true;
    house.add(floor);

    // Back wall
    const wallGeometry = new THREE.BoxGeometry(15, 10, 0.5);
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0xd2b48c,
        side: THREE.DoubleSide
    });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 5, -7.25);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    house.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-7.25, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    house.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(7.25, 5, 0);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    house.add(rightWall);

    // Front wall with door opening (split into two parts) - bigger door opening now 6 units
    const frontWallLeftGeometry = new THREE.BoxGeometry(3.5, 10, 0.5);
    const frontWallLeft = new THREE.Mesh(frontWallLeftGeometry, wallMaterial);
    frontWallLeft.position.set(-5.75, 5, 7.25);
    frontWallLeft.castShadow = true;
    frontWallLeft.receiveShadow = true;
    house.add(frontWallLeft);

    const frontWallRightGeometry = new THREE.BoxGeometry(3.5, 10, 0.5);
    const frontWallRight = new THREE.Mesh(frontWallRightGeometry, wallMaterial);
    frontWallRight.position.set(5.75, 5, 7.25);
    frontWallRight.castShadow = true;
    frontWallRight.receiveShadow = true;
    house.add(frontWallRight);

    // Door frame top
    const doorFrameTopGeometry = new THREE.BoxGeometry(6, 1, 0.5);
    const doorFrameTop = new THREE.Mesh(doorFrameTopGeometry, wallMaterial);
    doorFrameTop.position.set(0, 9.5, 7.25);
    doorFrameTop.castShadow = true;
    doorFrameTop.receiveShadow = true;
    house.add(doorFrameTop);

    // Door (can open/close) - bigger door now 5.5 units wide
    const doorGeometry = new THREE.BoxGeometry(5.5, 8.5, 0.3);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x654321
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-2.75, 4.25, 7.4); // Positioned to hinge on left side
    door.castShadow = true;
    door.receiveShadow = true;
    house.add(door);
    house.userData.door = door; // Store reference to door

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 100
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(2.2, 0, 0.2); // Position relative to door center
    door.add(handle); // Attach to door so it moves with it

    // Window in door
    const doorWindowGeometry = new THREE.BoxGeometry(1.5, 2, 0.1);
    const doorWindowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        emissive: 0x4488aa,
        transparent: true,
        opacity: 0.6
    });
    const doorWindow = new THREE.Mesh(doorWindowGeometry, doorWindowMaterial);
    doorWindow.position.set(0.8, 1.5, 0);
    door.add(doorWindow);

    // Roof (flat for simplicity)
    const roofGeometry = new THREE.BoxGeometry(16, 0.5, 16);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10.25;
    roof.castShadow = true;
    roof.receiveShadow = true;
    house.add(roof);

    // Couch inside the house
    // Couch base
    const couchBaseGeometry = new THREE.BoxGeometry(4, 1, 2);
    const couchMaterial = new THREE.MeshPhongMaterial({
        color: 0x4169e1
    });
    const couchBase = new THREE.Mesh(couchBaseGeometry, couchMaterial);
    couchBase.position.set(0, 0.5, -5);
    couchBase.castShadow = true;
    couchBase.receiveShadow = true;
    house.add(couchBase);

    // Couch back
    const couchBackGeometry = new THREE.BoxGeometry(4, 2, 0.5);
    const couchBack = new THREE.Mesh(couchBackGeometry, couchMaterial);
    couchBack.position.set(0, 1.5, -6);
    couchBack.castShadow = true;
    couchBack.receiveShadow = true;
    house.add(couchBack);

    // Couch left armrest
    const armrestGeometry = new THREE.BoxGeometry(0.5, 1.5, 2);
    const leftArmrest = new THREE.Mesh(armrestGeometry, couchMaterial);
    leftArmrest.position.set(-2, 1, -5);
    leftArmrest.castShadow = true;
    leftArmrest.receiveShadow = true;
    house.add(leftArmrest);

    // Couch right armrest
    const rightArmrest = new THREE.Mesh(armrestGeometry, couchMaterial);
    rightArmrest.position.set(2, 1, -5);
    rightArmrest.castShadow = true;
    rightArmrest.receiveShadow = true;
    house.add(rightArmrest);

    // Position house at specified location
    house.position.set(x, 0, z);
    house.userData.doorOpen = false; // Track door state
    scene.add(house);

    return house;
}

// Create 100 meter tall skyscraper with staircase
function createSkyscraper() {
    skyscraper = new THREE.Group();

    // Main building structure - 100 meters tall
    const buildingGeometry = new THREE.BoxGeometry(20, 100, 20);
    const buildingMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c3e50, // Dark blue-gray
        flatShading: true
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 50; // Center at 50m so it goes from 0 to 100
    building.castShadow = true;
    building.receiveShadow = true;
    skyscraper.add(building);

    // Add windows in a grid pattern
    const windowGeometry = new THREE.BoxGeometry(1.5, 2, 0.2);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        emissive: 0x6699cc,
        transparent: true,
        opacity: 0.8
    });

    // Add windows on all 4 sides, every 5 meters vertically
    for (let y = 5; y < 100; y += 5) {
        // Front side (z = 10)
        for (let x = -8; x <= 8; x += 4) {
            const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
            window1.position.set(x, y, 10.1);
            skyscraper.add(window1);
        }
        // Back side (z = -10)
        for (let x = -8; x <= 8; x += 4) {
            const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
            window2.position.set(x, y, -10.1);
            skyscraper.add(window2);
        }
        // Left side (x = -10)
        for (let z = -8; z <= 8; z += 4) {
            const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
            window3.position.set(-10.1, y, z);
            window3.rotation.y = Math.PI / 2;
            skyscraper.add(window3);
        }
        // Right side (x = 10)
        for (let z = -8; z <= 8; z += 4) {
            const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
            window4.position.set(10.1, y, z);
            window4.rotation.y = Math.PI / 2;
            skyscraper.add(window4);
        }
    }

    // Create spiral staircase in the center
    const stepHeight = 0.3;
    const stepDepth = 1.5;
    const stepWidth = 3;
    const radius = 4; // Distance from center
    const stepsPerRotation = 20;
    const totalSteps = 400; // Should reach about 100m height

    for (let i = 0; i < totalSteps; i++) {
        const angle = (i / stepsPerRotation) * Math.PI * 2;
        const yPos = i * stepHeight;

        // Create step
        const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
        const stepMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b7355, // Brown
            flatShading: true
        });
        const step = new THREE.Mesh(stepGeometry, stepMaterial);

        // Position step in spiral
        step.position.x = Math.cos(angle) * radius;
        step.position.y = yPos;
        step.position.z = Math.sin(angle) * radius;
        step.rotation.y = angle + Math.PI / 2; // Face toward center

        step.castShadow = true;
        step.receiveShadow = true;
        skyscraper.add(step);

        // Store step info for collision detection
        stairSteps.push({
            x: step.position.x,
            y: step.position.y,
            z: step.position.z,
            width: stepWidth,
            height: stepHeight,
            depth: stepDepth,
            rotation: step.rotation.y
        });
    }

    // Add entrance door opening on front side
    const doorFrameGeometry = new THREE.BoxGeometry(4, 6, 0.3);
    const doorFrameMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a
    });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(0, 3, 10.2);
    skyscraper.add(doorFrame);

    // Add roof/top platform
    const roofGeometry = new THREE.BoxGeometry(22, 1, 22);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 100.5;
    roof.castShadow = true;
    roof.receiveShadow = true;
    skyscraper.add(roof);

    // Position skyscraper in the world
    skyscraper.position.set(-50, 0, -50);
    scene.add(skyscraper);
}

// Create dog house (3 meters tall)
function createDogHouse() {
    dogHouse = new THREE.Group();

    // Main house body - 3 meters tall
    const houseGeometry = new THREE.BoxGeometry(4, 3, 4);
    const houseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
    const houseBody = new THREE.Mesh(houseGeometry, houseMaterial);
    houseBody.position.y = 1.5;
    houseBody.castShadow = true;
    dogHouse.add(houseBody);

    // Roof - triangular
    const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xA0522D }); // Darker brown
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 3.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    dogHouse.add(roof);

    // Door/entrance - arch shaped
    const doorGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16, 1, false, 0, Math.PI);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 }); // Black opening
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 2);
    door.rotation.x = Math.PI / 2;
    dogHouse.add(door);

    // Sign above door: "DOG"
    const signGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.1);
    const signMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 }); // Gold
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 2, 2.1);
    dogHouse.add(sign);

    // Position dog house in the world
    dogHouse.position.set(-15, 0, -15);
    scene.add(dogHouse);
}

// Create dog
function createDog() {
    dog = new THREE.Group();

    // Dog body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
    const dogMaterial = new THREE.MeshPhongMaterial({ color: 0xD2691E }); // Brown dog
    const body = new THREE.Mesh(bodyGeometry, dogMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    dog.add(body);

    // Dog head
    const headGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.6);
    const head = new THREE.Mesh(headGeometry, dogMaterial);
    head.position.set(0.9, 0.8, 0);
    head.castShadow = true;
    dog.add(head);

    // Snout
    const snoutGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const snoutMaterial = new THREE.MeshPhongMaterial({ color: 0xA0522D }); // Darker brown
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(1.25, 0.7, 0);
    dog.add(snout);

    // Ears (floppy)
    const earGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
    const leftEar = new THREE.Mesh(earGeometry, dogMaterial);
    leftEar.position.set(0.9, 1.1, -0.35);
    leftEar.rotation.z = -0.3;
    dog.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, dogMaterial);
    rightEar.position.set(0.9, 1.1, 0.35);
    rightEar.rotation.z = 0.3;
    dog.add(rightEar);

    // Legs (4 legs)
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);

    const frontLeftLeg = new THREE.Mesh(legGeometry, dogMaterial);
    frontLeftLeg.position.set(0.5, 0.3, -0.3);
    dog.add(frontLeftLeg);
    dog.frontLeftLeg = frontLeftLeg;

    const frontRightLeg = new THREE.Mesh(legGeometry, dogMaterial);
    frontRightLeg.position.set(0.5, 0.3, 0.3);
    dog.add(frontRightLeg);
    dog.frontRightLeg = frontRightLeg;

    const backLeftLeg = new THREE.Mesh(legGeometry, dogMaterial);
    backLeftLeg.position.set(-0.5, 0.3, -0.3);
    dog.add(backLeftLeg);
    dog.backLeftLeg = backLeftLeg;

    const backRightLeg = new THREE.Mesh(legGeometry, dogMaterial);
    backRightLeg.position.set(-0.5, 0.3, 0.3);
    dog.add(backRightLeg);
    dog.backRightLeg = backRightLeg;

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.8, 8);
    const tail = new THREE.Mesh(tailGeometry, dogMaterial);
    tail.position.set(-0.9, 0.8, 0);
    tail.rotation.z = Math.PI / 4;
    dog.add(tail);
    dog.tail = tail;

    // Position dog right next to the dog house
    dog.position.set(-12, 0, -15);
    dog.rotation.y = -Math.PI / 4; // Facing slightly towards player

    // Dog animation data
    dog.userData = {
        walkCycle: 0,
        tailWag: 0,
        jumpTimer: 0,
        velocityY: 0,
        isGrounded: true
    };

    scene.add(dog);
}

// Create actor's house with teleport entrance (BIGGER)
function createActorHouse() {
    actorHouse = new THREE.Group();

    // House structure - MUCH BIGGER
    const floorGeometry = new THREE.BoxGeometry(30, 0.5, 30);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0.25;
    floor.receiveShadow = true;
    actorHouse.add(floor);

    // Walls - doubled in size
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xDEB887 });

    // Front wall (with door) - adjusted for normal door size
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(11, 15, 0.5), wallMaterial);
    frontWallLeft.position.set(-9.5, 7.5, 14.75);
    frontWallLeft.castShadow = true;
    actorHouse.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(11, 15, 0.5), wallMaterial);
    frontWallRight.position.set(9.5, 7.5, 14.75);
    frontWallRight.castShadow = true;
    actorHouse.add(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 0.5), wallMaterial);
    frontWallTop.position.set(0, 11.5, 14.75);
    frontWallTop.castShadow = true;
    actorHouse.add(frontWallTop);

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 0.5), wallMaterial);
    backWall.position.set(0, 7.5, -14.75);
    backWall.castShadow = true;
    actorHouse.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 15, 30), wallMaterial);
    leftWall.position.set(-14.75, 7.5, 0);
    leftWall.castShadow = true;
    actorHouse.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 15, 30), wallMaterial);
    rightWall.position.set(14.75, 7.5, 0);
    rightWall.castShadow = true;
    actorHouse.add(rightWall);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(31, 0.5, 31);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 15.25;
    roof.castShadow = true;
    actorHouse.add(roof);

    // Door with special glow (indicates teleport) - normal size
    const doorGeometry = new THREE.BoxGeometry(4, 8, 0.3);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x00FFFF,
        emissive: 0x00AAAA,
        emissiveIntensity: 0.5
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 4, 14.9);
    actorHouse.add(door);

    // Sign: "ACTOR'S HOUSE" - bigger sign
    const signGeometry = new THREE.BoxGeometry(10, 1.5, 0.2);
    const signMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 12, 15.2);
    actorHouse.add(sign);

    // Position in world
    actorHouse.position.set(25, 0, 25);
    scene.add(actorHouse);
}

// Create the interior room (separate dimension) - MUCH BIGGER
function createInteriorRoom() {
    // Floor - 3x bigger!
    const floorGeometry = new THREE.BoxGeometry(60, 0.5, 60);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(1000, 0.25, 1000); // Far away from main world
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls - solid and impassable - MUCH BIGGER AND TALLER
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8B7355 });

    // North wall
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(60, 25, 1), wallMaterial);
    northWall.position.set(1000, 12.5, 970);
    northWall.castShadow = true;
    scene.add(northWall);
    roomWalls.push({ x: 1000, z: 970, width: 60, depth: 1 });

    // South wall
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(60, 25, 1), wallMaterial);
    southWall.position.set(1000, 12.5, 1030);
    southWall.castShadow = true;
    scene.add(southWall);
    roomWalls.push({ x: 1000, z: 1030, width: 60, depth: 1 });

    // East wall
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1, 25, 60), wallMaterial);
    eastWall.position.set(1030, 12.5, 1000);
    eastWall.castShadow = true;
    scene.add(eastWall);
    roomWalls.push({ x: 1030, z: 1000, width: 1, depth: 60 });

    // West wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(1, 25, 60), wallMaterial);
    westWall.position.set(970, 12.5, 1000);
    westWall.castShadow = true;
    scene.add(westWall);
    roomWalls.push({ x: 970, z: 1000, width: 1, depth: 60 });

    // Ceiling - higher
    const ceilingGeometry = new THREE.BoxGeometry(60, 0.5, 60);
    const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xF5DEB3 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(1000, 25, 1000);
    scene.add(ceiling);

    // Exit button (glowing red button) - bigger
    const buttonBase = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 0.8, 16),
        new THREE.MeshPhongMaterial({ color: 0xFF0000, emissive: 0xAA0000, emissiveIntensity: 0.7 })
    );
    buttonBase.position.set(1000, 2, 975);
    buttonBase.rotation.x = Math.PI / 2;
    scene.add(buttonBase);

    const buttonTop = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.6, 0.5, 16),
        new THREE.MeshPhongMaterial({ color: 0xFF4444, emissive: 0xFF0000, emissiveIntensity: 1 })
    );
    buttonTop.position.set(1000, 2, 974.2);
    buttonTop.rotation.x = Math.PI / 2;
    scene.add(buttonTop);

    exitButton = buttonBase;
    exitButton.userData.position = { x: 1000, y: 2, z: 975 };

    // FURNITURE
    // Couch against south wall
    const couchBase = new THREE.Mesh(
        new THREE.BoxGeometry(12, 3, 4),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    couchBase.position.set(1000, 1.5, 1024);
    scene.add(couchBase);

    const couchBack = new THREE.Mesh(
        new THREE.BoxGeometry(12, 4, 1),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    couchBack.position.set(1000, 3.5, 1026);
    scene.add(couchBack);

    // Couch arms
    const couchArmLeft = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4, 4),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    couchArmLeft.position.set(994.25, 3.5, 1024);
    scene.add(couchArmLeft);

    const couchArmRight = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4, 4),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    couchArmRight.position.set(1005.75, 3.5, 1024);
    scene.add(couchArmRight);

    // Coffee table in center
    const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.5, 6),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    tableTop.position.set(1000, 3, 1010);
    scene.add(tableTop);

    // Table legs
    const tableLegMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const legPositions = [
        [995.5, 1.5, 1007],
        [1004.5, 1.5, 1007],
        [995.5, 1.5, 1013],
        [1004.5, 1.5, 1013]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 3, 8),
            tableLegMaterial
        );
        leg.position.set(pos[0], pos[1], pos[2]);
        scene.add(leg);
    });

    // TV on north wall
    const tvStand = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2, 3),
        new THREE.MeshPhongMaterial({ color: 0x2F4F4F })
    );
    tvStand.position.set(1000, 1, 973);
    scene.add(tvStand);

    const tvScreen = new THREE.Mesh(
        new THREE.BoxGeometry(10, 6, 0.5),
        new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            emissive: 0x003366,
            emissiveIntensity: 0.3
        })
    );
    tvScreen.position.set(1000, 6, 972.5);
    scene.add(tvScreen);

    // TV frame
    const tvFrame = new THREE.Mesh(
        new THREE.BoxGeometry(10.5, 6.5, 0.3),
        new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    tvFrame.position.set(1000, 6, 972.4);
    scene.add(tvFrame);

    // Dining table on east side
    const diningTableTop = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.6, 6),
        new THREE.MeshPhongMaterial({ color: 0xA0522D })
    );
    diningTableTop.position.set(1020, 4, 990);
    scene.add(diningTableTop);

    // Dining table legs
    const diningLegPositions = [
        [1017, 2, 987.5],
        [1023, 2, 987.5],
        [1017, 2, 992.5],
        [1023, 2, 992.5]
    ];
    diningLegPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 4, 8),
            new THREE.MeshPhongMaterial({ color: 0x654321 })
        );
        leg.position.set(pos[0], pos[1], pos[2]);
        scene.add(leg);
    });

    // Chairs around dining table
    const createChair = (x, z, rotation) => {
        const chairGroup = new THREE.Group();

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.4, 2),
            new THREE.MeshPhongMaterial({ color: 0x8B4513 })
        );
        seat.position.y = 2.5;
        chairGroup.add(seat);

        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(2, 3, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x654321 })
        );
        backrest.position.set(0, 4.2, -0.85);
        chairGroup.add(backrest);

        // Legs
        const chairLegPositions = [
            [-0.7, 1.2, -0.7],
            [0.7, 1.2, -0.7],
            [-0.7, 1.2, 0.7],
            [0.7, 1.2, 0.7]
        ];
        chairLegPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 2.4, 8),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            leg.position.set(pos[0], pos[1], pos[2]);
            chairGroup.add(leg);
        });

        chairGroup.position.set(x, 0, z);
        chairGroup.rotation.y = rotation;
        scene.add(chairGroup);
    };

    // Place 4 chairs around dining table
    createChair(1020, 985, 0);           // North chair
    createChair(1020, 995, Math.PI);     // South chair
    createChair(1015, 990, Math.PI / 2); // West chair
    createChair(1025, 990, -Math.PI / 2);// East chair

    // Bookshelf on west wall
    const bookshelf = new THREE.Mesh(
        new THREE.BoxGeometry(6, 10, 2),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    bookshelf.position.set(973, 5, 985);
    scene.add(bookshelf);

    // Shelf dividers
    for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(5.8, 0.3, 1.8),
            new THREE.MeshPhongMaterial({ color: 0x654321 })
        );
        shelf.position.set(973, 2 + i * 2.5, 985);
        scene.add(shelf);
    }

    // Books on shelves
    const bookColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
    for (let shelf = 0; shelf < 3; shelf++) {
        for (let i = 0; i < 8; i++) {
            const book = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 1.5, 0.3),
                new THREE.MeshPhongMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
            );
            book.position.set(970.2 + i * 0.7, 2.5 + shelf * 2.5, 984.5 + Math.random() * 0.3);
            book.rotation.y = (Math.random() - 0.5) * 0.2;
            scene.add(book);
        }
    }

    // Lamp on coffee table
    const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1, 0.5, 16),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    lampBase.position.set(1004, 3.5, 1010);
    scene.add(lampBase);

    const lampPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 3, 8),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    lampPole.position.set(1004, 5.2, 1010);
    scene.add(lampPole);

    const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 1.5, 16),
        new THREE.MeshPhongMaterial({
            color: 0xFFFACD,
            emissive: 0xFFFF99,
            emissiveIntensity: 0.4
        })
    );
    lampShade.position.set(1004, 7.2, 1010);
    scene.add(lampShade);

    // Add a point light from the lamp
    const lampLight = new THREE.PointLight(0xFFFFAA, 0.8, 20);
    lampLight.position.set(1004, 7, 1010);
    scene.add(lampLight);
}

// Create NPC stick man at specified position with color
function createNPC(x, y, z, color) {
    const npc = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
    const jointMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 5.5;
    head.castShadow = true;
    npc.add(head);

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 3.75;
    torso.castShadow = true;
    npc.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.8, 4.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    npc.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.8, 4.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    npc.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);

    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 1.25, 0);
    leftLeg.castShadow = true;
    npc.add(leftLeg);
    npc.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 1.25, 0);
    rightLeg.castShadow = true;
    npc.add(rightLeg);
    npc.rightLeg = rightLeg;

    // Joints (for visual detail)
    const jointGeometry = new THREE.SphereGeometry(0.12, 8, 8);

    const leftShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    leftShoulder.position.set(-0.5, 4.8, 0);
    npc.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    rightShoulder.position.set(0.5, 4.8, 0);
    npc.add(rightShoulder);

    const leftHip = new THREE.Mesh(jointGeometry, jointMaterial);
    leftHip.position.set(-0.3, 2.5, 0);
    npc.add(leftHip);

    const rightHip = new THREE.Mesh(jointGeometry, jointMaterial);
    rightHip.position.set(0.3, 2.5, 0);
    npc.add(rightHip);

    // Position NPC
    npc.position.set(x, y, z);

    // NPC movement data
    npc.userData = {
        moveTimer: Math.random() * 5000, // Random start time
        moveDirection: Math.random() * Math.PI * 2, // Random direction
        moveDuration: 2000 + Math.random() * 3000, // How long to move
        waitDuration: 1000 + Math.random() * 4000, // How long to wait
        isMoving: false,
        homeX: x, // Remember home position
        homeZ: z,
        walkCycle: 0
    };

    scene.add(npc);
    npcs.push(npc);

    return npc;
}

// AI Brain Functions
function updateAISensors() {
    if (!aiPlayer) return;

    aiBrain.sensors.altitude = aiPlayer.position.y;
    aiBrain.sensors.velocityY = aiVelocity.y;
    aiBrain.sensors.isGrounded = aiGrounded;
    aiBrain.sensors.timeSinceLastJump += 16;

    // Find nearest trampoline
    let minTrампDist = Infinity;
    for (let i = 0; i < trampolines.length; i++) {
        const tramp = trampolines[i];
        const dx = tramp.position.x - aiPlayer.position.x;
        const dz = tramp.position.z - aiPlayer.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minTrампDist) minTrампDist = dist;
    }
    aiBrain.sensors.nearestTrampolineDistance = minTrампDist;

    // Update memory
    aiBrain.memory.timeAlive += 16;
    if (aiBrain.sensors.altitude > aiBrain.memory.maxAltitudeReached) {
        aiBrain.memory.maxAltitudeReached = aiBrain.sensors.altitude;
        // Success increases confidence and excitement
        aiBrain.emotions.confidence = Math.min(1, aiBrain.emotions.confidence + 0.05);
        aiBrain.emotions.excitement = Math.min(1, aiBrain.emotions.excitement + 0.1);
        aiBrain.emotions.frustration = Math.max(0, aiBrain.emotions.frustration - 0.05);
    }
}

function aiBrainThink() {
    // Neural network-like decision making
    // Inputs: sensors + emotions + weights + instructions
    // Output: action decision

    const altitude = aiBrain.sensors.altitude;
    const confidence = aiBrain.emotions.confidence;
    const frustration = aiBrain.emotions.frustration;
    const determination = aiBrain.emotions.determination;

    // Check if there's an instruction to follow
    if (aiInstruction) {
        // Parse instruction and adjust behavior
        if (aiInstruction.includes('jump')) {
            return { explore: 0, seekTrampoline: 2, seekPlatform: 0, customAction: 'jump' };
        } else if (aiInstruction.includes('explore')) {
            return { explore: 2, seekTrampoline: 0, seekPlatform: 0 };
        } else if (aiInstruction.includes('stay') || aiInstruction.includes('stop')) {
            return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'idle' };
        } else if (aiInstruction.includes('go to') || aiInstruction.includes('move to')) {
            // Try to parse location from instruction
            if (aiInstruction.includes('house')) {
                return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'goToHouse' };
            } else if (aiInstruction.includes('shop')) {
                return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'goToShop' };
            } else if (aiInstruction.includes('dog')) {
                return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'goToDog' };
            }
        } else if (aiInstruction.includes('trampoline')) {
            return { explore: 0, seekTrampoline: 2, seekPlatform: 0 };
        } else if (aiInstruction.includes('platform') || aiInstruction.includes('1600')) {
            return { explore: 0, seekTrampoline: 0.5, seekPlatform: 2 };
        } else if (aiInstruction.includes('dance') || aiInstruction.includes('spin')) {
            return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'dance' };
        } else if (aiInstruction.includes('follow')) {
            return { explore: 0, seekTrampoline: 0, seekPlatform: 0, customAction: 'followPlayer' };
        }
    }

    // Calculate decision scores with HEAVY exploration bias
    let exploreScore = aiBrain.weights.explorationDrive * 1.5 + frustration * 0.5; // Boosted exploration
    let trampolineScore = aiBrain.weights.trampolineSeekingDrive * determination * 0.8;
    let platformScore = aiBrain.weights.platformSeekingDrive * confidence * 0.7;

    // Always add base exploration bonus
    exploreScore += 0.4; // Constant exploration tendency

    // Adjust based on distance to nearest trampoline
    if (aiBrain.sensors.nearestTrampolineDistance < 50) {
        trampolineScore += 0.3;
    }

    // Frustration GREATLY increases exploration
    if (frustration > 0.4) { // Lower threshold
        exploreScore += 0.5; // Much larger boost
        aiBrain.weights.riskTaking = Math.min(0.95, aiBrain.weights.riskTaking + 0.05);
    }

    // Even high confidence keeps exploration active
    if (confidence > 0.7) {
        platformScore += 0.2;
        exploreScore += 0.2; // High confidence = curious exploration
    }

    // Excitement increases exploration
    if (aiBrain.emotions.excitement > 0.6) {
        exploreScore += 0.3;
    }

    // Decay emotions over time (slower)
    aiBrain.emotions.excitement *= 0.995;
    aiBrain.emotions.frustration *= 0.998;

    // If altitude hasn't increased in a while, increase frustration AND exploration
    if (aiBrain.memory.timeAlive > 5000 && altitude < 100) {
        aiBrain.emotions.frustration = Math.min(1, aiBrain.emotions.frustration + 0.001);
        exploreScore += 0.3;
    }

    // Return decision based on highest score
    return {
        explore: exploreScore,
        seekTrampoline: trampolineScore,
        seekPlatform: platformScore
    };
}

function aiLearnFromExperience(success) {
    // Reinforcement learning - adjust weights based on outcomes
    if (success) {
        aiBrain.memory.successfulJumps++;
        aiBrain.emotions.confidence = Math.min(1, aiBrain.emotions.confidence + aiBrain.learningRate);
        aiBrain.emotions.frustration = Math.max(0, aiBrain.emotions.frustration - aiBrain.learningRate);

        // Reinforce successful behaviors
        if (aiBrain.recentDecisions.length > 0) {
            const lastDecision = aiBrain.recentDecisions[aiBrain.recentDecisions.length - 1];
            if (lastDecision === 'trampoline') {
                aiBrain.weights.trampolineSeekingDrive = Math.min(1, aiBrain.weights.trampolineSeekingDrive + aiBrain.learningRate * 0.5);
            }
        }
    } else {
        aiBrain.memory.failedAttempts++;
        aiBrain.emotions.frustration = Math.min(1, aiBrain.emotions.frustration + aiBrain.learningRate * 0.5);
        aiBrain.emotions.confidence = Math.max(0, aiBrain.emotions.confidence - aiBrain.learningRate * 0.3);

        // Try different approach
        aiBrain.weights.explorationDrive = Math.min(1, aiBrain.weights.explorationDrive + aiBrain.learningRate * 0.3);
    }
}

function resetAIBrain() {
    aiBrain.memory = {
        maxAltitudeReached: 0,
        trampolinesUsed: 0,
        platformsReached: [],
        failedAttempts: 0,
        successfulJumps: 0,
        timeAlive: 0
    };
    aiBrain.emotions = {
        confidence: 0.5,
        frustration: 0,
        excitement: 0.5,
        determination: 1
    };
    aiBrain.recentDecisions = [];
}

// Create AI player
function createAIPlayer() {
    if (aiPlayer) {
        // Remove existing AI player
        scene.remove(aiPlayer);
    }

    const ai = new THREE.Group();

    // Materials - distinctive yellow color for AI
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const jointMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 5.5;
    head.castShadow = true;
    ai.add(head);

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 3.75;
    torso.castShadow = true;
    ai.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.8, 4.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    ai.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.8, 4.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    ai.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);

    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 1.25, 0);
    leftLeg.castShadow = true;
    ai.add(leftLeg);
    ai.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 1.25, 0);
    rightLeg.castShadow = true;
    ai.add(rightLeg);
    ai.rightLeg = rightLeg;

    // Joints
    const jointGeometry = new THREE.SphereGeometry(0.12, 8, 8);

    const leftShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    leftShoulder.position.set(-0.5, 4.8, 0);
    ai.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(jointGeometry, jointMaterial);
    rightShoulder.position.set(0.5, 4.8, 0);
    ai.add(rightShoulder);

    const leftHip = new THREE.Mesh(jointGeometry, jointMaterial);
    leftHip.position.set(-0.3, 2.5, 0);
    ai.add(leftHip);

    const rightHip = new THREE.Mesh(jointGeometry, jointMaterial);
    rightHip.position.set(0.3, 2.5, 0);
    ai.add(rightHip);

    // Position AI player at spawn
    ai.position.set(10, 0, 10);

    // AI data
    ai.userData = {
        walkCycle: 0,
        targetX: 0,
        targetZ: 0
    };

    scene.add(ai);
    aiPlayer = ai;
    aiVelocity = { x: 0, y: 0, z: 0 };
    aiGrounded = false;
    aiDecisionTimer = 0;
    aiCurrentAction = 'idle';
    aiJumpTimer = 0;

    // Reset AI brain
    resetAIBrain();
}

// Handle key press
function onKeyDown(event) {
    keys[event.code] = true;

    // Jump on spacebar (Player 1)
    if (event.code === 'Space') {
        if (isGrounded) {
            jump();
        } else if (hasDoubleJump && !hasUsedDoubleJump) {
            // Double jump in air
            jump();
            hasUsedDoubleJump = true;
        }
    }

    // Jump on Shift (Player 2)
    if (event.code === 'ShiftLeft' && isGrounded2 && twoPlayerMode) {
        jump2();
    }

    // Buy trampoline at shop with E key
    if (event.code === 'KeyE') {
        buyTrampoline();
    }

    // Buy backflip at shop with B key
    if (event.code === 'KeyB') {
        buyBackflip();
    }

    // Buy double jump at shop with J key
    if (event.code === 'KeyJ') {
        buyDoubleJump();
    }


    // Open command bar with / key
    if (event.key === '/' && !commandBarOpen) {
        event.preventDefault();
        openCommandBar();
    }
}

// Handle key release
function onKeyUp(event) {
    keys[event.code] = false;
}

// Jump function
function jump() {
    const currentTime = Date.now();
    const timeSinceLanding = currentTime - landingTime;

    // Check if this is a perfect jump
    if (perfectJumpWindow && timeSinceLanding < PERFECT_JUMP_WINDOW) {
        // Perfect jump - increase jump power
        jumpPower += 0.15;
        showPerfectJumpMessage();
    } else {
        // Reset jump power to base
        jumpPower = baseJumpPower;
    }

    // Apply jump with trampoline and backflip boosts
    let finalJumpPower = jumpPower;

    // Apply backflip multiplier if purchased
    if (hasBackflip) {
        finalJumpPower *= backflipMultiplier;
    }

    // Apply trampoline boost
    if (onTrampoline) {
        finalJumpPower *= TRAMPOLINE_BOOST;
        animateTrampoline();

        // Award coin for jumping on trampoline
        coins += 1;
        document.getElementById('coins').textContent = coins;
    }

    velocity.y = finalJumpPower;
    isGrounded = false;
    perfectJumpWindow = false;

    // Play jump sound
    playJumpSound();

    // Start backflip animation if purchased
    if (hasBackflip) {
        isBackflipping = true;
        backflipStartTime = Date.now();
    }

    // Animate legs for jump (only if not backflipping)
    if (!hasBackflip && stickMan.leftLeg && stickMan.rightLeg) {
        stickMan.leftLeg.rotation.x = -0.3;
        stickMan.rightLeg.rotation.x = -0.3;
    }
}

// Jump function for player 2
function jump2() {
    velocity2.y = baseJumpPower;
    isGrounded2 = false;

    // Play jump sound
    playJumpSound();

    // Animate legs for jump
    if (stickMan2 && stickMan2.leftLeg && stickMan2.rightLeg) {
        stickMan2.leftLeg.rotation.x = -0.3;
        stickMan2.rightLeg.rotation.x = -0.3;
    }
}

// Animate trampoline when jumping
function animateTrampoline() {
    if (trampoline && trampoline.surface) {
        // Compress the surface
        trampoline.surface.scale.y = 0.3;
        trampoline.solidSurface.position.y = -0.1;

        // Return to normal after a short delay
        setTimeout(() => {
            trampoline.surface.scale.y = 1;
            trampoline.solidSurface.position.y = 0.05;
        }, 150);
    }
}

// Show perfect jump message
function showPerfectJumpMessage() {
    const message = document.getElementById('perfectJump');
    message.style.opacity = '1';
    setTimeout(() => {
        message.style.opacity = '0';
    }, 500);
}

// Buy trampoline function
function buyTrampoline() {
    // Check if player is near shop
    const distanceToShop = Math.sqrt(
        Math.pow(stickMan.position.x - shop.position.x, 2) +
        Math.pow(stickMan.position.z - shop.position.z, 2)
    );

    if (distanceToShop < 8 && stickMan.position.y < 5) {
        if (coins >= trampolinePrice) {
            // Purchase successful
            coins -= trampolinePrice;
            ownedTrampolines++;

            // Play cha-ching sound
            playChaChing();

            // Update UI
            document.getElementById('coins').textContent = coins;
            document.getElementById('trampolineCount').textContent = ownedTrampolines;

            // Create new trampoline at random position
            createNewTrampoline();
        }
    }
}

// Buy backflip upgrade function
function buyBackflip() {
    // Check if player is near shop
    const distanceToShop = Math.sqrt(
        Math.pow(stickMan.position.x - shop.position.x, 2) +
        Math.pow(stickMan.position.z - shop.position.z, 2)
    );

    if (distanceToShop < 8 && stickMan.position.y < 5) {
        if (!hasBackflip && coins >= backflipPrice) {
            // Purchase successful
            coins -= backflipPrice;
            hasBackflip = true;

            // Play cha-ching sound
            playChaChing();

            // Update UI
            document.getElementById('coins').textContent = coins;
            document.getElementById('backflipStatus').textContent = '✓';
        }
    }
}

// Buy double jump upgrade function
function buyDoubleJump() {
    // Check if player is near shop
    const distanceToShop = Math.sqrt(
        Math.pow(stickMan.position.x - shop.position.x, 2) +
        Math.pow(stickMan.position.z - shop.position.z, 2)
    );

    if (distanceToShop < 8 && stickMan.position.y < 5) {
        if (!hasDoubleJump && coins >= doubleJumpPrice) {
            // Purchase successful
            coins -= doubleJumpPrice;
            hasDoubleJump = true;

            // Play cha-ching sound
            playChaChing();

            // Update UI
            document.getElementById('coins').textContent = coins;
            document.getElementById('doubleJumpStatus').textContent = '✓';
        }
    }
}

// Toggle placement mode
function togglePlacementMode() {
    // Can only enter placement mode if you have trampolines and are on ground
    if (!placementMode && ownedTrampolines > 0 && stickMan.position.y < 5) {
        placementMode = true;

        // Create ghost trampoline
        ghostTrampoline = createTrampolineObject();

        // Make it semi-transparent
        ghostTrampoline.traverse((child) => {
            if (child.material) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.5;
                child.material.emissive = new THREE.Color(0x00ff00);
            }
        });

        // Position it in front of player
        ghostPosition.x = stickMan.position.x;
        ghostPosition.z = stickMan.position.z;
        ghostTrampoline.position.set(ghostPosition.x, 0.05, ghostPosition.z);
        scene.add(ghostTrampoline);
    }
}

// Confirm placement
function confirmPlacement() {
    if (placementMode && ownedTrampolines > 0) {
        ownedTrampolines--;
        document.getElementById('trampolineCount').textContent = ownedTrampolines;

        // Create real trampoline at ghost position
        const newTrampoline = createTrampolineObject();
        newTrampoline.position.set(ghostPosition.x, 0.05, ghostPosition.z);
        scene.add(newTrampoline);
        trampolines.push(newTrampoline);

        // Exit placement mode
        cancelPlacement();
    }
}

// Cancel placement
function cancelPlacement() {
    if (placementMode) {
        placementMode = false;

        // Remove ghost trampoline
        if (ghostTrampoline) {
            scene.remove(ghostTrampoline);
            ghostTrampoline = null;
        }
    }
}

// Create a new trampoline at random position (for shop purchases)
function createNewTrampoline() {
    // Random position on ground (not too close to shop or spawn)
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = 15 + Math.random() * 30;
    const x = Math.cos(randomAngle) * randomDistance;
    const z = Math.sin(randomAngle) * randomDistance;

    const newTrampoline = createTrampolineObject();
    newTrampoline.position.set(x, 0.05, z);
    scene.add(newTrampoline);
    trampolines.push(newTrampoline);
}

// Create a trampoline object (reusable function)
function createTrampolineObject() {
    const newTrampoline = new THREE.Group();

    // Frame (outer circle)
    const frameGeometry = new THREE.TorusGeometry(TRAMPOLINE_SIZE / 2, 0.2, 16, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.rotation.x = Math.PI / 2;
    frame.castShadow = true;
    newTrampoline.add(frame);

    // Jumping surface (circular mesh pattern)
    const surfaceGeometry = new THREE.CylinderGeometry(
        TRAMPOLINE_SIZE / 2 - 0.3,
        TRAMPOLINE_SIZE / 2 - 0.3,
        0.1,
        32
    );
    const surfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        emissive: 0x000000,
        wireframe: true,
        wireframeLinewidth: 2
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = 0;
    newTrampoline.add(surface);

    // Solid surface for visual effect (slightly transparent blue)
    const solidSurfaceGeometry = new THREE.CircleGeometry(TRAMPOLINE_SIZE / 2 - 0.3, 32);
    const solidSurfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const solidSurface = new THREE.Mesh(solidSurfaceGeometry, solidSurfaceMaterial);
    solidSurface.rotation.x = -Math.PI / 2;
    solidSurface.position.y = 0.05;
    newTrampoline.add(solidSurface);

    // Springs around the edge
    const springCount = 16;
    const springGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const springMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

    for (let i = 0; i < springCount; i++) {
        const angle = (i / springCount) * Math.PI * 2;
        const spring = new THREE.Mesh(springGeometry, springMaterial);
        spring.position.x = Math.cos(angle) * (TRAMPOLINE_SIZE / 2);
        spring.position.z = Math.sin(angle) * (TRAMPOLINE_SIZE / 2);
        spring.position.y = -0.25;
        spring.castShadow = true;
        newTrampoline.add(spring);
    }

    // Store the surface for animation
    newTrampoline.surface = surface;
    newTrampoline.solidSurface = solidSurface;
    newTrampoline.receiveShadow = true;

    return newTrampoline;
}

// Update game state
function update() {
    // Skip update if game is frozen
    if (tickSpeed === 0) {
        return;
    }

    // Track previous grounded state for dog jump detection
    wasGrounded = isGrounded;

    const moveSpeed = 0.2 * tickSpeed * speedMultiplier;

    // If in placement mode, move ghost trampoline instead of player
    if (placementMode) {
        const placementSpeed = 0.3;

        if (keys['ArrowLeft']) {
            ghostPosition.x -= placementSpeed;
        }
        if (keys['ArrowRight']) {
            ghostPosition.x += placementSpeed;
        }
        if (keys['ArrowUp']) {
            ghostPosition.z -= placementSpeed;
        }
        if (keys['ArrowDown']) {
            ghostPosition.z += placementSpeed;
        }

        // Update ghost trampoline position
        if (ghostTrampoline) {
            ghostTrampoline.position.set(ghostPosition.x, 0.05, ghostPosition.z);

            // Rotate ghost trampoline for visual feedback
            ghostTrampoline.rotation.y = Date.now() * 0.001;
        }

        // Skip normal player movement
        return;
    }

    // Normal player movement (when not in placement mode)
    // Horizontal movement
    if (keys['ArrowLeft']) {
        velocity.x = -moveSpeed;
        stickMan.rotation.y = Math.PI / 2;
    } else if (keys['ArrowRight']) {
        velocity.x = moveSpeed;
        stickMan.rotation.y = -Math.PI / 2;
    } else {
        velocity.x *= 0.9; // Friction
    }

    // Forward/backward movement
    if (keys['ArrowUp']) {
        velocity.z = -moveSpeed;
        if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
            stickMan.rotation.y = 0;
        }
    } else if (keys['ArrowDown']) {
        velocity.z = moveSpeed;
        if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
            stickMan.rotation.y = Math.PI;
        }
    } else {
        velocity.z *= 0.9; // Friction
    }

    // Fly mode - vertical movement with Space (up) and D (down)
    if (flyMode) {
        if (keys['Space']) {
            velocity.y = moveSpeed * 1.5; // Fly up
        } else if (keys['KeyD']) {
            velocity.y = -moveSpeed * 1.5; // Fly down
        } else {
            velocity.y *= 0.9; // Slow down vertical movement
        }
        isGrounded = false; // Never grounded in fly mode
    } else {
        // Apply gravity when not in fly mode
        if (!isGrounded) {
            velocity.y -= 0.02 * tickSpeed;
        }
    }

    // Update position
    stickMan.position.x += velocity.x;
    stickMan.position.y += velocity.y;
    stickMan.position.z += velocity.z;

    // House wall collision for all houses
    if (stickMan.position.y < 10) { // Only check collisions when near ground level
        for (let i = 0; i < houses.length; i++) {
            const house = houses[i];
            const houseX = house.position.x;
            const houseZ = house.position.z;
            const houseMinX = houseX - 7.5;
            const houseMaxX = houseX + 7.5;
            const houseMinZ = houseZ - 7.5;
            const houseMaxZ = houseZ + 7.5;
            const doorMinX = houseX - 3; // Door is 6 units wide, centered
            const doorMaxX = houseX + 3;
            const doorZ = houseZ + 7.5; // Front wall position

            // Check if player is trying to enter the house area
            if (stickMan.position.x > houseMinX && stickMan.position.x < houseMaxX &&
                stickMan.position.z > houseMinZ && stickMan.position.z < houseMaxZ) {

                // Allow entry through the door (front wall)
                if (stickMan.position.z > doorZ - 1) {
                    // Check if within door opening
                    if (stickMan.position.x < doorMinX || stickMan.position.x > doorMaxX) {
                        // Hit front wall outside door - push back
                        stickMan.position.z = doorZ - 1;
                        velocity.z = 0;
                    }
                }
            } else {
                // Check collision with walls from outside
                // Left wall
                if (stickMan.position.x < houseMinX + 0.5 && stickMan.position.x > houseMinX - 1 &&
                    stickMan.position.z > houseMinZ && stickMan.position.z < houseMaxZ) {
                    stickMan.position.x = houseMinX - 1;
                    velocity.x = 0;
                }
                // Right wall
                if (stickMan.position.x > houseMaxX - 0.5 && stickMan.position.x < houseMaxX + 1 &&
                    stickMan.position.z > houseMinZ && stickMan.position.z < houseMaxZ) {
                    stickMan.position.x = houseMaxX + 1;
                    velocity.x = 0;
                }
                // Back wall
                if (stickMan.position.z < houseMinZ + 0.5 && stickMan.position.z > houseMinZ - 1 &&
                    stickMan.position.x > houseMinX && stickMan.position.x < houseMaxX) {
                    stickMan.position.z = houseMinZ - 1;
                    velocity.z = 0;
                }
                // Front wall (outside door area)
                if (stickMan.position.z > doorZ - 0.5 && stickMan.position.z < doorZ + 1) {
                    if (stickMan.position.x < doorMinX || stickMan.position.x > doorMaxX) {
                        if (stickMan.position.x > houseMinX - 1 && stickMan.position.x < houseMaxX + 1) {
                            stickMan.position.z = doorZ + 1;
                            velocity.z = 0;
                        }
                    }
                }
            }
        }
    }

    // Staircase collision detection
    if (skyscraper && stairSteps.length > 0) {
        const skyX = skyscraper.position.x;
        const skyZ = skyscraper.position.z;

        // Check if player is inside the skyscraper bounds
        if (stickMan.position.x > skyX - 10 && stickMan.position.x < skyX + 10 &&
            stickMan.position.z > skyZ - 10 && stickMan.position.z < skyZ + 10 &&
            stickMan.position.y < 105) { // Within skyscraper height + a bit

            // Find nearby steps and check collision
            let onStair = false;
            for (let i = 0; i < stairSteps.length; i++) {
                const step = stairSteps[i];
                const stepWorldX = skyX + step.x;
                const stepWorldZ = skyZ + step.z;

                // Check if player is near this step horizontally
                const dx = stickMan.position.x - stepWorldX;
                const dz = stickMan.position.z - stepWorldZ;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance < 2 && stickMan.position.y <= step.y + step.height &&
                    stickMan.position.y >= step.y - 1) {
                    // Player is on this step
                    if (velocity.y <= 0) {
                        stickMan.position.y = step.y + step.height;
                        velocity.y = 0;
                        isGrounded = true;
                        hasUsedDoubleJump = false;
                        onStair = true;
                        break;
                    }
                }
            }

            // Check roof collision at top
            if (stickMan.position.y >= 100 && stickMan.position.y < 101 && velocity.y <= 0) {
                stickMan.position.y = 101;
                velocity.y = 0;
                isGrounded = true;
                hasUsedDoubleJump = false;
            }
        }
    }

    // Animate backflip rotation
    if (isBackflipping && !isGrounded) {
        const backflipElapsed = Date.now() - backflipStartTime;
        const backflipDuration = 800; // Duration of backflip animation in milliseconds

        if (backflipElapsed < backflipDuration) {
            // Complete one full rotation (2 * Math.PI)
            const progress = backflipElapsed / backflipDuration;
            stickMan.rotation.x = progress * Math.PI * 2;
        } else {
            // Backflip complete
            stickMan.rotation.x = 0;
            isBackflipping = false;
        }
    }

    // Reset rotation when grounded (if not doing backflip)
    if (isGrounded && !isBackflipping) {
        stickMan.rotation.x = 0;
    }

    // Player 2 movement (WASD controls)
    if (twoPlayerMode && stickMan2) {
        // Horizontal movement
        if (keys['KeyA']) {
            velocity2.x = -moveSpeed;
            stickMan2.rotation.y = Math.PI / 2;
        } else if (keys['KeyD']) {
            velocity2.x = moveSpeed;
            stickMan2.rotation.y = -Math.PI / 2;
        } else {
            velocity2.x *= 0.9; // Friction
        }

        // Forward/backward movement
        if (keys['KeyW']) {
            velocity2.z = -moveSpeed;
            if (!keys['KeyA'] && !keys['KeyD']) {
                stickMan2.rotation.y = 0;
            }
        } else if (keys['KeyS']) {
            velocity2.z = moveSpeed;
            if (!keys['KeyA'] && !keys['KeyD']) {
                stickMan2.rotation.y = Math.PI;
            }
        } else {
            velocity2.z *= 0.9; // Friction
        }

        // Apply gravity for player 2
        if (!isGrounded2) {
            velocity2.y -= 0.02 * tickSpeed;
        }

        // Update player 2 position
        stickMan2.position.x += velocity2.x;
        stickMan2.position.y += velocity2.y;
        stickMan2.position.z += velocity2.z;

        // Ground collision for player 2
        if (stickMan2.position.y <= 0) {
            stickMan2.position.y = 0;
            velocity2.y = 0;
            if (!isGrounded2) {
                isGrounded2 = true;
                // Reset leg rotation
                if (stickMan2.leftLeg && stickMan2.rightLeg) {
                    stickMan2.leftLeg.rotation.x = 0;
                    stickMan2.rightLeg.rotation.x = 0;
                }
            }
        } else {
            isGrounded2 = false;
        }

        // Leg animation for player 2 and footstep sounds
        if ((keys['KeyA'] || keys['KeyD'] || keys['KeyW'] || keys['KeyS']) && isGrounded2) {
            const time = Date.now() * 0.01;
            if (stickMan2.leftLeg && stickMan2.rightLeg) {
                stickMan2.leftLeg.rotation.x = Math.sin(time) * 0.3;
                stickMan2.rightLeg.rotation.x = -Math.sin(time) * 0.3;
            }

            // Play footstep sound at intervals for player 2
            const currentTime = Date.now();
            if (currentTime - lastFootstepTime2 > footstepInterval) {
                playFootstep();
                lastFootstepTime2 = currentTime;
            }
        }
    }

    // Check if on any trampoline
    onTrampoline = false;
    for (let i = 0; i < trampolines.length; i++) {
        const tramp = trampolines[i];
        const distanceToTrampoline = Math.sqrt(
            Math.pow(stickMan.position.x - tramp.position.x, 2) +
            Math.pow(stickMan.position.z - tramp.position.z, 2)
        );
        if (distanceToTrampoline < (TRAMPOLINE_SIZE / 2) && stickMan.position.y < 3) {
            onTrampoline = true;
            break;
        }
    }

    // Show cloud platform when player reaches altitude 300 or higher
    if (stickMan.position.y >= CLOUD_ALTITUDE - 50 && cloudPlatform) {
        cloudPlatform.visible = true;
    }

    // Show satellite when player reaches altitude 500 or higher
    if (stickMan.position.y >= SATELLITE_ALTITUDE - 50 && satellite) {
        satellite.visible = true;
    }

    // Show moon when player reaches altitude 600 or higher
    if (stickMan.position.y >= MOON_ALTITUDE - 50 && moonSurface) {
        moonSurface.visible = true;
    }

    // Show Mars when player reaches altitude 700 or higher
    if (stickMan.position.y >= MARS_ALTITUDE - 50 && marsSurface) {
        marsSurface.visible = true;
    }

    // Show alien planet when player reaches altitude 1000 or higher
    if (stickMan.position.y >= ALIEN_ALTITUDE - 50 && alienPlanet) {
        alienPlanet.visible = true;
    }

    // Show rocket when player reaches altitude 1000 or higher
    if (stickMan.position.y >= ROCKET_ALTITUDE - 50 && rocket) {
        rocket.visible = true;
    }

    // Show flat land when player reaches altitude 1600 or higher
    if (stickMan.position.y >= FLATLAND_ALTITUDE - 50 && flatLand) {
        flatLand.visible = true;
    }

    // Check if near rocket (enter rocket to fly)
    const distanceToRocket = Math.sqrt(
        Math.pow(stickMan.position.x - rocket.position.x, 2) +
        Math.pow(stickMan.position.z - rocket.position.z, 2)
    );
    const nearRocket = distanceToRocket < 3;
    const atRocketHeight = Math.abs(stickMan.position.y - rocket.position.y) < 5;

    // Enter rocket if close enough and not already in rocket
    if (nearRocket && atRocketHeight && !inRocket) {
        inRocket = true;
        rocketStartTime = Date.now();
        stickMan.visible = false; // Hide stick man when in rocket

        // Show timer
        document.getElementById('rocketTimer').style.opacity = '1';
    }

    // Rocket flight mode
    if (inRocket) {
        const elapsedTime = Date.now() - rocketStartTime;
        const remainingTime = Math.max(0, Math.ceil((rocketFlightDuration - elapsedTime) / 1000));

        // Update timer display
        document.getElementById('timerValue').textContent = remainingTime;

        // Move rocket based on arrow keys (fly freely)
        const rocketSpeed = 0.5;
        if (keys['ArrowLeft']) {
            rocket.position.x -= rocketSpeed;
            rocket.rotation.z = Math.PI / 12;
        } else if (keys['ArrowRight']) {
            rocket.position.x += rocketSpeed;
            rocket.rotation.z = -Math.PI / 12;
        } else {
            rocket.rotation.z *= 0.9; // Return to vertical
        }

        if (keys['ArrowUp']) {
            rocket.position.y += rocketSpeed;
        } else if (keys['ArrowDown']) {
            rocket.position.y -= rocketSpeed;
        }

        if (keys['KeyW']) {
            rocket.position.z -= rocketSpeed;
        } else if (keys['KeyS']) {
            rocket.position.z += rocketSpeed;
        }

        // Animate rocket flame while flying
        if (rocket.flame) {
            rocket.flame.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3;
            rocket.flame.material.opacity = 0.6 + Math.sin(Date.now() * 0.015) * 0.2;
        }

        // Position stick man with rocket (hidden)
        stickMan.position.copy(rocket.position);

        // Update camera to follow rocket
        camera.position.x = rocket.position.x;
        camera.position.y = rocket.position.y + 15;
        camera.position.z = rocket.position.z + 25;
        camera.lookAt(rocket.position.x, rocket.position.y, rocket.position.z);

        // Check if time is up
        if (elapsedTime >= rocketFlightDuration) {
            inRocket = false;
            stickMan.visible = true; // Show stick man again
            document.getElementById('rocketTimer').style.opacity = '0';

            // Eject from rocket at current position
            stickMan.position.copy(rocket.position);
            velocity.y = 0; // Start falling
        }

        return; // Skip normal movement and collision when in rocket
    }

    // Check if on flat land surface
    const distanceFromFlatLandCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearFlatLand = distanceFromFlatLandCenter < (FLATLAND_SIZE / 2);
    const atFlatLandHeight = stickMan.position.y >= FLATLAND_ALTITUDE && stickMan.position.y <= FLATLAND_ALTITUDE + 10;
    onFlatLand = nearFlatLand && atFlatLandHeight && velocity.y <= 0;

    // Check if on alien planet surface
    const distanceFromAlienCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearAlienPlanet = distanceFromAlienCenter < (ALIEN_PLANET_SIZE / 2);
    const atAlienHeight = stickMan.position.y >= ALIEN_ALTITUDE && stickMan.position.y <= ALIEN_ALTITUDE + 10;
    onAlienPlanet = nearAlienPlanet && atAlienHeight && velocity.y <= 0;

    // Check if on Mars surface
    const distanceFromMarsCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearMars = distanceFromMarsCenter < (MARS_SURFACE_SIZE / 2);
    const atMarsHeight = stickMan.position.y >= MARS_ALTITUDE && stickMan.position.y <= MARS_ALTITUDE + 10;
    onMars = nearMars && atMarsHeight && velocity.y <= 0;

    // Check if on moon surface
    const distanceFromMoonCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearMoon = distanceFromMoonCenter < (MOON_SURFACE_SIZE / 2);
    const atMoonHeight = stickMan.position.y >= MOON_ALTITUDE && stickMan.position.y <= MOON_ALTITUDE + 10;
    onMoon = nearMoon && atMoonHeight && velocity.y <= 0;

    // Check if on satellite platform
    const distanceFromSatelliteCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearSatellite = distanceFromSatelliteCenter < (SATELLITE_PLATFORM_SIZE / 2);
    const atSatelliteHeight = stickMan.position.y >= SATELLITE_ALTITUDE + 2 && stickMan.position.y <= SATELLITE_ALTITUDE + 10;
    onSatellite = nearSatellite && atSatelliteHeight && velocity.y <= 0;

    // Check if on cloud platform
    const distanceFromCloudCenter = Math.sqrt(
        Math.pow(stickMan.position.x, 2) +
        Math.pow(stickMan.position.z, 2)
    );
    const nearCloudPlatform = distanceFromCloudCenter < (CLOUD_PLATFORM_SIZE / 2);
    const atCloudHeight = stickMan.position.y >= CLOUD_ALTITUDE && stickMan.position.y <= CLOUD_ALTITUDE + 5;
    onCloudPlatform = nearCloudPlatform && atCloudHeight && velocity.y <= 0 && !onSatellite && !onMoon && !onMars && !onAlienPlanet && !onFlatLand;

    // Flat land collision (check first since it's highest)
    if (onFlatLand && velocity.y <= 0) {
        stickMan.position.y = FLATLAND_ALTITUDE;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on flat land
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Alien planet collision
    else if (onAlienPlanet && velocity.y <= 0) {
        stickMan.position.y = ALIEN_ALTITUDE;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on alien planet
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Mars surface collision
    else if (onMars && velocity.y <= 0) {
        stickMan.position.y = MARS_ALTITUDE;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on Mars
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Moon surface collision
    else if (onMoon && velocity.y <= 0) {
        stickMan.position.y = MOON_ALTITUDE;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on moon
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Satellite platform collision
    else if (onSatellite && velocity.y <= 0) {
        stickMan.position.y = SATELLITE_ALTITUDE + 2.5;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on satellite
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Cloud platform collision
    else if (onCloudPlatform && velocity.y <= 0) {
        stickMan.position.y = CLOUD_ALTITUDE;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed on cloud
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }
    // Ground collision
    else if (stickMan.position.y <= 0) {
        stickMan.position.y = 0;
        velocity.y = 0;

        if (!isGrounded) {
            // Just landed
            isGrounded = true;
            hasUsedDoubleJump = false;
            landingTime = Date.now();
            perfectJumpWindow = true;

            // Landing effects
            playLandSound();
            createLandingEffect(stickMan.position);

            // Reset leg rotation
            if (stickMan.leftLeg && stickMan.rightLeg) {
                stickMan.leftLeg.rotation.x = 0;
                stickMan.rightLeg.rotation.x = 0;
            }

            // Set timer to close perfect jump window
            setTimeout(() => {
                perfectJumpWindow = false;
            }, PERFECT_JUMP_WINDOW);
        }
    }

    // Actor house teleport logic
    if (actorHouse && !insideActorHouse) {
        const houseX = actorHouse.position.x;
        const houseZ = actorHouse.position.z;
        const doorX = houseX;
        const doorZ = houseZ + 14.9; // Updated for bigger house

        // Check if player is near the door
        const distanceToDoor = Math.sqrt(
            Math.pow(stickMan.position.x - doorX, 2) +
            Math.pow(stickMan.position.z - doorZ, 2)
        );

        if (distanceToDoor < 3 && stickMan.position.y < 9) { // Normal detection area for normal door
            // Teleport player into the room!
            stickMan.position.set(1000, 1, 1000);
            velocity.x = 0;
            velocity.y = 0;
            velocity.z = 0;
            insideActorHouse = true;
            showCommandMessage('Entered Actor\'s House!');
        }
    }

    // Room wall collision (when inside actor's house)
    if (insideActorHouse) {
        for (let i = 0; i < roomWalls.length; i++) {
            const wall = roomWalls[i];
            const halfWidth = wall.width / 2;
            const halfDepth = wall.depth / 2;

            // Check collision with each wall
            if (Math.abs(stickMan.position.x - wall.x) < halfWidth + 0.5 &&
                Math.abs(stickMan.position.z - wall.z) < halfDepth + 0.5 &&
                stickMan.position.y < 15) {

                // Push player away from wall
                const dx = stickMan.position.x - wall.x;
                const dz = stickMan.position.z - wall.z;

                if (Math.abs(dx) > Math.abs(dz)) {
                    // Horizontal collision
                    if (dx > 0) {
                        stickMan.position.x = wall.x + halfWidth + 0.5;
                    } else {
                        stickMan.position.x = wall.x - halfWidth - 0.5;
                    }
                } else {
                    // Vertical collision
                    if (dz > 0) {
                        stickMan.position.z = wall.z + halfDepth + 0.5;
                    } else {
                        stickMan.position.z = wall.z - halfDepth - 0.5;
                    }
                }
            }
        }

        // Check if player pressed the exit button
        if (exitButton) {
            const distanceToButton = Math.sqrt(
                Math.pow(stickMan.position.x - exitButton.userData.position.x, 2) +
                Math.pow(stickMan.position.z - exitButton.userData.position.z, 2)
            );

            if (distanceToButton < 4 && stickMan.position.y < 4) {
                // Teleport player back outside!
                stickMan.position.set(25, 1, 32);
                velocity.x = 0;
                velocity.y = 0;
                velocity.z = 0;
                insideActorHouse = false;
                showCommandMessage('Exited Actor\'s House!');
            }
        }
    }

    // Update altitude
    currentAltitude = Math.round(stickMan.position.y * 10) / 10;
    if (currentAltitude > maxAltitude) {
        maxAltitude = currentAltitude;
    }

    // Update UI
    document.getElementById('altitude').textContent = currentAltitude.toFixed(1);
    document.getElementById('maxAlt').textContent = maxAltitude.toFixed(1);

    // Camera follow - closer when inside actor's house
    if (insideActorHouse) {
        // Much closer camera for interior view
        camera.position.x = stickMan.position.x;
        camera.position.y = stickMan.position.y + 5;
        camera.position.z = stickMan.position.z + 8;
        camera.lookAt(stickMan.position.x, stickMan.position.y + 2, stickMan.position.z);
    } else {
        // Normal camera distance for outside
        camera.position.x = stickMan.position.x;
        camera.position.y = stickMan.position.y + 10;
        camera.position.z = stickMan.position.z + 20;
        camera.lookAt(stickMan.position.x, stickMan.position.y + 5, stickMan.position.z);
    }

    // Add subtle leg animation when moving and play footstep sounds
    if ((keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown']) && isGrounded) {
        const time = Date.now() * 0.01;
        if (stickMan.leftLeg && stickMan.rightLeg) {
            stickMan.leftLeg.rotation.x = Math.sin(time) * 0.3;
            stickMan.rightLeg.rotation.x = -Math.sin(time) * 0.3;
        }

        // Play footstep sound at intervals
        const currentTime = Date.now();
        if (currentTime - lastFootstepTime > footstepInterval) {
            playFootstep();
            lastFootstepTime = currentTime;
        }
    }

    // Animate clouds (gentle floating motion)
    if (clouds.length > 0) {
        const time = Date.now() * 0.0005;
        clouds.forEach((cloud, index) => {
            cloud.position.y += Math.sin(time + index) * 0.01;
        });
    }

    // Rotate satellite slowly
    if (satellite && satellite.visible) {
        satellite.rotation.y += satellite.rotationSpeed;
    }

    // Animate bad guys (patrol movement and bobbing)
    if (badGuys.length > 0 && alienPlanet && alienPlanet.visible) {
        const time = Date.now() * 0.001;
        badGuys.forEach((badGuy) => {
            // Update patrol angle
            badGuy.userData.angle += badGuy.userData.speed * badGuy.userData.direction;

            // Calculate new position (circular patrol)
            badGuy.position.x = Math.cos(badGuy.userData.angle) * badGuy.userData.distance;
            badGuy.position.z = Math.sin(badGuy.userData.angle) * badGuy.userData.distance;

            // Add bobbing motion
            badGuy.position.y = 1 + Math.sin(time * 2 + badGuy.userData.angle) * 0.3;

            // Rotate to face movement direction
            badGuy.rotation.y = badGuy.userData.angle + Math.PI / 2;
        });
    }

    // Animate dinosaurs (patrol movement and bobbing)
    if (dinosaurs.length > 0 && flatLand && flatLand.visible) {
        const time = Date.now() * 0.001;
        dinosaurs.forEach((dino) => {
            // Update patrol angle
            dino.userData.angle += dino.userData.speed * dino.userData.direction;

            // Calculate new position (circular patrol)
            dino.position.x = Math.cos(dino.userData.angle) * dino.userData.distance;
            dino.position.z = Math.sin(dino.userData.angle) * dino.userData.distance;

            // Add bobbing motion
            dino.position.y = Math.sin(time * 2 + dino.userData.angle) * 0.3;

            // Rotate to face movement direction
            dino.rotation.y = dino.userData.angle + Math.PI / 2;
        });
    }

    // Transition sky to space at high altitude
    if (stickMan.position.y >= SATELLITE_ALTITUDE - 100) {
        // Gradually transition from blue sky to black space
        const transitionProgress = Math.min((stickMan.position.y - (SATELLITE_ALTITUDE - 100)) / 100, 1);

        // Interpolate from sky blue (0x87CEEB) to black (0x000000)
        const startColor = { r: 0x87 / 255, g: 0xCE / 255, b: 0xEB / 255 };
        const endColor = { r: 0, g: 0, b: 0 };

        const currentR = startColor.r + (endColor.r - startColor.r) * transitionProgress;
        const currentG = startColor.g + (endColor.g - startColor.g) * transitionProgress;
        const currentB = startColor.b + (endColor.b - startColor.b) * transitionProgress;

        scene.background.setRGB(currentR, currentG, currentB);

        // Fade in stars as we transition to space
        if (starField) {
            starField.material.opacity = transitionProgress;
        }
    } else {
        // Reset to blue sky at lower altitudes
        scene.background.setHex(0x87CEEB);
        if (starField) {
            starField.material.opacity = 0;
        }
    }

    // Show shop prompt when near shop
    const distanceToShop = Math.sqrt(
        Math.pow(stickMan.position.x - shop.position.x, 2) +
        Math.pow(stickMan.position.z - shop.position.z, 2)
    );

    if (distanceToShop < 8 && stickMan.position.y < 5) {
        document.getElementById('shopPrompt').style.opacity = '1';
    } else {
        document.getElementById('shopPrompt').style.opacity = '0';
    }

    // Show placement prompt when in placement mode
    if (placementMode) {
        document.getElementById('placementPrompt').style.opacity = '1';
    } else {
        document.getElementById('placementPrompt').style.opacity = '0';
    }

    // Update NPCs
    const currentTime = Date.now();
    for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        const data = npc.userData;

        data.moveTimer += 16; // Roughly 60fps

        if (data.isMoving) {
            // NPC is moving
            if (data.moveTimer >= data.moveDuration) {
                // Stop moving
                data.isMoving = false;
                data.moveTimer = 0;
                data.waitDuration = 1000 + Math.random() * 4000;
            } else {
                // Continue moving
                const moveSpeed = 0.02;
                npc.position.x += Math.cos(data.moveDirection) * moveSpeed;
                npc.position.z += Math.sin(data.moveDirection) * moveSpeed;

                // Constrain to small area around home position
                const dx = npc.position.x - data.homeX;
                const dz = npc.position.z - data.homeZ;
                const distFromHome = Math.sqrt(dx * dx + dz * dz);
                if (distFromHome > 4) {
                    // Too far from home, turn back
                    data.moveDirection = Math.atan2(data.homeZ - npc.position.z, data.homeX - npc.position.x);
                }

                // Animate walking
                data.walkCycle += 0.15;
                if (npc.leftLeg && npc.rightLeg) {
                    npc.leftLeg.rotation.x = Math.sin(data.walkCycle) * 0.3;
                    npc.rightLeg.rotation.x = Math.sin(data.walkCycle + Math.PI) * 0.3;
                }
            }
        } else {
            // NPC is waiting
            if (data.moveTimer >= data.waitDuration) {
                // Start moving
                data.isMoving = true;
                data.moveTimer = 0;
                data.moveDirection = Math.random() * Math.PI * 2;
                data.moveDuration = 2000 + Math.random() * 3000;
            }
        }
    }

    // Animate dog (tail wag and follow player when close)
    if (dog) {
        dog.userData.tailWag += 0.1;
        dog.userData.walkCycle += 0.05;

        // Calculate distance to player
        const dogToPlayerX = stickMan.position.x - dog.position.x;
        const dogToPlayerZ = stickMan.position.z - dog.position.z;
        const distanceToPlayer = Math.sqrt(dogToPlayerX * dogToPlayerX + dogToPlayerZ * dogToPlayerZ);

        // ALWAYS face towards player (head/snout at +X in local coords needs rotation adjustment)
        // Calculate angle from dog to player
        const angleToPlayer = Math.atan2(dogToPlayerZ, dogToPlayerX);
        // Add 180 degrees (Math.PI) since the butt was facing the player
        dog.rotation.y = angleToPlayer + Math.PI;

        // Apply gravity to dog
        if (!dog.userData.isGrounded) {
            dog.userData.velocityY -= 0.01;
        }
        dog.position.y += dog.userData.velocityY;

        // Ground collision for dog
        if (dog.position.y <= 0) {
            dog.position.y = 0;
            dog.userData.velocityY = 0;
            dog.userData.isGrounded = true;
        } else if (dog.position.y > 0.1) {
            dog.userData.isGrounded = false;
        }

        // Follow player if close (within 15 units) but not too close (stop at 2 units)
        if (distanceToPlayer < 15 && distanceToPlayer > 2) {
            // Move towards player
            const moveSpeed = 0.15;
            const dirX = dogToPlayerX / distanceToPlayer;
            const dirZ = dogToPlayerZ / distanceToPlayer;

            dog.position.x += dirX * moveSpeed;
            dog.position.z += dirZ * moveSpeed;

            // Faster walk cycle when following
            dog.userData.walkCycle += 0.15;

            // Animate legs while walking
            if (dog.frontLeftLeg && dog.frontRightLeg && dog.backLeftLeg && dog.backRightLeg) {
                dog.frontLeftLeg.rotation.x = Math.sin(dog.userData.walkCycle) * 0.4;
                dog.frontRightLeg.rotation.x = Math.sin(dog.userData.walkCycle + Math.PI) * 0.4;
                dog.backLeftLeg.rotation.x = Math.sin(dog.userData.walkCycle + Math.PI) * 0.4;
                dog.backRightLeg.rotation.x = Math.sin(dog.userData.walkCycle) * 0.4;
            }

            // Wag tail faster when excited/following
            dog.userData.tailWag += 0.15;

            // Jump when player jumps (mimic player jump)
            // Detect if player just jumped (was grounded but now has upward velocity)
            if (!isGrounded && wasGrounded && velocity.y > 0.15 && dog.userData.isGrounded) {
                // Dog jumps to 6 meters high
                // Using physics: v^2 = 2 * g * h, where h = 6, g = 0.01
                // v = sqrt(2 * 0.01 * 6) = sqrt(0.12) ≈ 0.346
                dog.userData.velocityY = 0.346;
                dog.userData.isGrounded = false;
            }
        } else {
            // Reset leg positions when not walking
            if (dog.frontLeftLeg && dog.frontRightLeg && dog.backLeftLeg && dog.backRightLeg) {
                dog.frontLeftLeg.rotation.x = 0;
                dog.frontRightLeg.rotation.x = 0;
                dog.backLeftLeg.rotation.x = 0;
                dog.backRightLeg.rotation.x = 0;
            }
        }

        // Wag tail
        if (dog.tail) {
            dog.tail.rotation.x = Math.sin(dog.userData.tailWag) * 0.4;
        }

        // Add subtle breathing animation only when grounded
        if (dog.userData.isGrounded) {
            dog.position.y += Math.sin(dog.userData.walkCycle * 0.5) * 0.02;
        }
    }

    // Update AI player with neural network brain
    if (aiPlayer) {
        // Apply gravity
        aiVelocity.y -= 0.01 * tickSpeed;
        aiPlayer.position.y += aiVelocity.y;

        // Ground collision
        const wasGrounded = aiGrounded;
        if (aiPlayer.position.y <= 0) {
            aiPlayer.position.y = 0;
            aiVelocity.y = 0;
            aiGrounded = true;

            // Learn from landing
            if (!wasGrounded) {
                const landingAltitude = aiBrain.memory.maxAltitudeReached;
                if (landingAltitude > aiBrain.sensors.altitude) {
                    aiLearnFromExperience(false); // Failed to gain altitude
                }
            }
        } else {
            aiGrounded = false;
        }

        // Update AI brain sensors
        updateAISensors();

        // Automatic jump every 10 seconds (basic reflex)
        aiJumpTimer += 16;
        if (aiJumpTimer >= 10000 && aiGrounded) {
            aiVelocity.y = 0.3;
            aiGrounded = false;
            aiJumpTimer = 0;
            aiBrain.sensors.timeSinceLastJump = 0;
        }

        // AI brain decision making - very frequent for active exploration
        aiDecisionTimer += 16;

        if (aiDecisionTimer > 150) { // Make decision every 150ms (VERY FAST)
            aiDecisionTimer = 0;

            // Use AI brain to make decision
            const brainDecision = aiBrainThink();
            const currentAltitude = aiPlayer.position.y;
            const targetAltitude = 1600;

            // Determine highest priority action
            let chosenAction = null;
            let maxScore = -1;

            for (let action in brainDecision) {
                if (brainDecision[action] > maxScore) {
                    maxScore = brainDecision[action];
                    chosenAction = action;
                }
            }

            // Handle custom actions from instructions
            if (brainDecision.customAction) {
                const customAction = brainDecision.customAction;

                if (customAction === 'jump' && aiGrounded) {
                    aiVelocity.y = 0.4;
                    aiGrounded = false;
                    aiJumpTimer = 0;
                } else if (customAction === 'idle') {
                    aiCurrentAction = 'idle';
                    aiPlayer.userData.targetX = aiPlayer.position.x;
                    aiPlayer.userData.targetZ = aiPlayer.position.z;
                } else if (customAction === 'goToHouse') {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = 25;
                    aiPlayer.userData.targetZ = 40;
                } else if (customAction === 'goToShop') {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = shop.position.x;
                    aiPlayer.userData.targetZ = shop.position.z;
                } else if (customAction === 'goToDog') {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = -12;
                    aiPlayer.userData.targetZ = -15;
                } else if (customAction === 'dance') {
                    // Make AI spin
                    aiPlayer.rotation.y += 0.1;
                } else if (customAction === 'followPlayer') {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = stickMan.position.x;
                    aiPlayer.userData.targetZ = stickMan.position.z;
                }
            }
            // Execute brain decision
            else if (chosenAction === 'seekPlatform' && currentAltitude < targetAltitude) {
                // Determine target platform based on current altitude
                let targetPlatform = null;

                if (currentAltitude < 280 && cloudPlatform) {
                    targetPlatform = cloudPlatform;
                } else if (currentAltitude >= 280 && currentAltitude < 480 && satellite) {
                    targetPlatform = satellite;
                } else if (currentAltitude >= 480 && currentAltitude < 580 && moonSurface) {
                    targetPlatform = moonSurface;
                } else if (currentAltitude >= 580 && currentAltitude < 680 && marsSurface) {
                    targetPlatform = marsSurface;
                } else if (currentAltitude >= 680 && currentAltitude < 980 && alienPlanet) {
                    targetPlatform = alienPlanet;
                } else if (currentAltitude >= 980 && flatLand) {
                    targetPlatform = flatLand;
                }

                if (targetPlatform) {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = targetPlatform.position.x;
                    aiPlayer.userData.targetZ = targetPlatform.position.z;
                    aiBrain.recentDecisions.push('platform');
                }
            } else if (chosenAction === 'seekTrampoline') {
                // Find nearest trampoline
                let nearestTrampoline = null;
                let minDist = Infinity;

                for (let i = 0; i < trampolines.length; i++) {
                    const tramp = trampolines[i];
                    const dx = tramp.position.x - aiPlayer.position.x;
                    const dz = tramp.position.z - aiPlayer.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);

                    if (dist < minDist && dist < 200) {
                        minDist = dist;
                        nearestTrampoline = tramp;
                    }
                }

                if (nearestTrampoline) {
                    aiCurrentAction = 'move';
                    aiPlayer.userData.targetX = nearestTrampoline.position.x;
                    aiPlayer.userData.targetZ = nearestTrampoline.position.z;
                    aiBrain.recentDecisions.push('trampoline');
                }
            } else if (chosenAction === 'explore' || currentAltitude >= targetAltitude) {
                // Explore randomly with HUGE range
                const exploreRange = 100 + aiBrain.emotions.frustration * 80 + aiBrain.emotions.excitement * 60; // Much larger exploration!
                aiCurrentAction = 'move';
                aiPlayer.userData.targetX = aiPlayer.position.x + (Math.random() - 0.5) * exploreRange;
                aiPlayer.userData.targetZ = aiPlayer.position.z + (Math.random() - 0.5) * exploreRange;
                aiBrain.recentDecisions.push('explore');

                // Boost excitement during exploration
                aiBrain.emotions.excitement = Math.min(1, aiBrain.emotions.excitement + 0.05);
            }

            // Keep decision history manageable
            if (aiBrain.recentDecisions.length > 10) {
                aiBrain.recentDecisions.shift();
            }
        }

        // Execute AI action - always move or jump, never idle
        if (aiCurrentAction === 'move') {
            const dx = aiPlayer.userData.targetX - aiPlayer.position.x;
            const dz = aiPlayer.userData.targetZ - aiPlayer.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance > 0.5) {
                const moveSpeed = 0.35; // Even faster movement speed
                aiPlayer.position.x += (dx / distance) * moveSpeed;
                aiPlayer.position.z += (dz / distance) * moveSpeed;

                // Faster walking animation
                aiPlayer.userData.walkCycle += 0.3;
                if (aiPlayer.leftLeg && aiPlayer.rightLeg) {
                    aiPlayer.leftLeg.rotation.x = Math.sin(aiPlayer.userData.walkCycle) * 0.5;
                    aiPlayer.rightLeg.rotation.x = Math.sin(aiPlayer.userData.walkCycle + Math.PI) * 0.5;
                }

                // Try to jump if reached target
                if (distance < 2 && aiGrounded) {
                    aiVelocity.y = 0.3;
                    aiGrounded = false;
                }
            } else {
                // Reached target, pick new target immediately with wide exploration
                const newExploreRange = 80 + Math.random() * 60;
                aiPlayer.userData.targetX = aiPlayer.position.x + (Math.random() - 0.5) * newExploreRange;
                aiPlayer.userData.targetZ = aiPlayer.position.z + (Math.random() - 0.5) * newExploreRange;
            }
        } else if (aiCurrentAction === 'jump' && aiGrounded) {
            aiVelocity.y = 0.3;
            aiGrounded = false;
            aiCurrentAction = 'move'; // Immediately switch back to moving
        }

        // Trampoline collision for AI - use proper trampoline boost
        for (let i = 0; i < trampolines.length; i++) {
            const tramp = trampolines[i];
            const distanceToTrampoline = Math.sqrt(
                Math.pow(aiPlayer.position.x - tramp.position.x, 2) +
                Math.pow(aiPlayer.position.z - tramp.position.z, 2)
            );

            if (distanceToTrampoline < 3 && aiPlayer.position.y <= 1.5 && aiPlayer.position.y >= 0 && aiVelocity.y <= 0) {
                // Use same jump boost as player: 0.3 * 1.5 = 0.45
                aiVelocity.y = 0.3 * 1.5;
                aiGrounded = false;

                // AI learns from successful trampoline use
                aiBrain.memory.trampolinesUsed++;
                aiLearnFromExperience(true);
                aiBrain.sensors.timeSinceLastJump = 0;
            }
        }

        // Cloud platform collision (300m)
        if (cloudPlatform && aiPlayer.position.y >= 290 && aiPlayer.position.y <= 305) {
            const dx = aiPlayer.position.x - cloudPlatform.position.x;
            const dz = aiPlayer.position.z - cloudPlatform.position.z;
            if (Math.abs(dx) < 10 && Math.abs(dz) < 10 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 300;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('cloud')) {
                    aiBrain.memory.platformsReached.push('cloud');
                    aiLearnFromExperience(true);
                }
            }
        }

        // Satellite collision (500m)
        if (satellite && aiPlayer.position.y >= 490 && aiPlayer.position.y <= 505) {
            const dx = aiPlayer.position.x - satellite.position.x;
            const dz = aiPlayer.position.z - satellite.position.z;
            if (Math.abs(dx) < 5 && Math.abs(dz) < 5 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 500;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('satellite')) {
                    aiBrain.memory.platformsReached.push('satellite');
                    aiLearnFromExperience(true);
                }
            }
        }

        // Moon surface collision (600m)
        if (moonSurface && aiPlayer.position.y >= 590 && aiPlayer.position.y <= 605) {
            const dx = aiPlayer.position.x - moonSurface.position.x;
            const dz = aiPlayer.position.z - moonSurface.position.z;
            if (Math.abs(dx) < 15 && Math.abs(dz) < 15 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 600;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('moon')) {
                    aiBrain.memory.platformsReached.push('moon');
                    aiLearnFromExperience(true);
                }
            }
        }

        // Mars surface collision (700m)
        if (marsSurface && aiPlayer.position.y >= 690 && aiPlayer.position.y <= 705) {
            const dx = aiPlayer.position.x - marsSurface.position.x;
            const dz = aiPlayer.position.z - marsSurface.position.z;
            if (Math.abs(dx) < 20 && Math.abs(dz) < 20 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 700;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('mars')) {
                    aiBrain.memory.platformsReached.push('mars');
                    aiLearnFromExperience(true);
                }
            }
        }

        // Alien planet collision (1000m)
        if (alienPlanet && aiPlayer.position.y >= 990 && aiPlayer.position.y <= 1005) {
            const dx = aiPlayer.position.x - alienPlanet.position.x;
            const dz = aiPlayer.position.z - alienPlanet.position.z;
            if (Math.abs(dx) < 25 && Math.abs(dz) < 25 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 1000;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('alien')) {
                    aiBrain.memory.platformsReached.push('alien');
                    aiLearnFromExperience(true);
                }
            }
        }

        // Flat land collision (1600m) - GOAL!
        if (flatLand && aiPlayer.position.y >= 1590 && aiPlayer.position.y <= 1605) {
            const dx = aiPlayer.position.x - flatLand.position.x;
            const dz = aiPlayer.position.z - flatLand.position.z;
            if (Math.abs(dx) < 50 && Math.abs(dz) < 50 && aiVelocity.y <= 0) {
                aiPlayer.position.y = 1600;
                aiVelocity.y = 0;
                aiGrounded = true;
                if (!aiBrain.memory.platformsReached.includes('flatland')) {
                    aiBrain.memory.platformsReached.push('flatland');
                    aiLearnFromExperience(true);
                    aiBrain.emotions.excitement = 1.0; // Maximum excitement!
                    aiBrain.emotions.confidence = 1.0;
                }
            }
        }
    }

    // Check proximity to NPCs for dialogue
    if (!dialogueActive) {
        for (let i = 0; i < npcs.length; i++) {
            const npc = npcs[i];
            if (npc.userData.hasDialogue) {
                const dx = stickMan.position.x - npc.position.x;
                const dz = stickMan.position.z - npc.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance < 5 && stickMan.position.y < 10) {
                    // Player is near NPC, show dialogue
                    dialogueActive = true;
                    dialogueNPC = npc;
                    document.getElementById('dialogueQuestion').textContent = npc.userData.question;
                    document.getElementById('dialogueBox').style.display = 'block';
                    break;
                }
            }
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Open command bar
function openCommandBar() {
    commandBarOpen = true;
    document.getElementById('commandBar').style.display = 'block';
    document.getElementById('commandInput').focus();
}

// Close command bar
function closeCommandBar() {
    commandBarOpen = false;
    document.getElementById('commandBar').style.display = 'none';
    document.getElementById('commandInput').blur();
}

// Create food hat
function createFoodHat() {
    // Remove existing food hat if any
    if (foodHat) {
        stickMan.remove(foodHat);
        foodHat = null;
    }

    foodHat = new THREE.Group();

    // Create a pizza slice on top of head
    // Pizza base (triangle)
    const pizzaShape = new THREE.Shape();
    pizzaShape.moveTo(0, 0);
    pizzaShape.lineTo(-0.6, -1);
    pizzaShape.lineTo(0.6, -1);
    pizzaShape.lineTo(0, 0);

    const pizzaGeometry = new THREE.ExtrudeGeometry(pizzaShape, {
        depth: 0.15,
        bevelEnabled: false
    });
    const pizzaMaterial = new THREE.MeshPhongMaterial({
        color: 0xffa500, // Orange cheese
        flatShading: true
    });
    const pizza = new THREE.Mesh(pizzaGeometry, pizzaMaterial);
    pizza.rotation.x = Math.PI / 2;
    pizza.position.y = 0.8;
    foodHat.add(pizza);

    // Pizza crust (triangle outline)
    const crustMaterial = new THREE.MeshPhongMaterial({
        color: 0xd2691e // Brown crust
    });
    const crustGeometry = new THREE.TorusGeometry(0.05, 0.03, 8, 3);
    const crust = new THREE.Mesh(crustGeometry, crustMaterial);
    crust.position.set(0, 0.8, -0.5);
    crust.rotation.x = Math.PI / 2;
    foodHat.add(crust);

    // Pepperoni slices (red circles)
    const pepperoniGeometry = new THREE.CircleGeometry(0.12, 16);
    const pepperoniMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000 // Red pepperoni
    });

    for (let i = 0; i < 3; i++) {
        const pepperoni = new THREE.Mesh(pepperoniGeometry, pepperoniMaterial);
        const xPos = (i - 1) * 0.25;
        pepperoni.position.set(xPos, 0.81, -0.5);
        pepperoni.rotation.x = -Math.PI / 2;
        foodHat.add(pepperoni);
    }

    // Position food hat on stick man's head
    foodHat.position.y = 5.5;

    stickMan.add(foodHat);
}

// Handle command execution
function handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    if (cmd === '/tp') {
        const altitude = parseFloat(parts[1]);
        if (!isNaN(altitude)) {
            // Teleport player to altitude
            stickMan.position.y = altitude;
            velocity.y = 0;
            showCommandMessage(`Teleported to altitude ${altitude}m`);
        } else {
            showCommandMessage('Invalid altitude');
        }
    } else if (cmd === '/give' && parts[1] && parts[1].toLowerCase() === 'coin') {
        const amount = parseInt(parts[2]);
        if (!isNaN(amount) && amount > 0) {
            // Give coins to player
            coins += amount;
            document.getElementById('coins').textContent = coins;
            showCommandMessage(`Given ${amount} coins!`);
        } else {
            showCommandMessage('Invalid coin amount');
        }
    } else if (cmd === '/jumpboost') {
        const multiplier = parseFloat(parts[1]);
        if (!isNaN(multiplier) && multiplier > 0) {
            // Set jump power boost
            baseJumpPower = 0.3 * multiplier;
            jumpPower = baseJumpPower;
            showCommandMessage(`Jump boost set to ${multiplier}x!`);
        } else {
            showCommandMessage('Invalid multiplier');
        }
    } else if (cmd === '/food') {
        createFoodHat();
        showCommandMessage('Pizza hat equipped!');
    } else if (cmd === '/tick') {
        const option = parts[1] ? parts[1].toLowerCase() : '';
        if (option === 'freeze') {
            tickSpeed = 0;
            showCommandMessage('Game FROZEN!');
        } else if (option === 'fast') {
            tickSpeed = 2;
            showCommandMessage('Game speed: FAST (2x)');
        } else if (option === 'slow') {
            tickSpeed = 0.5;
            showCommandMessage('Game speed: SLOW (0.5x)');
        } else if (option === 'normal') {
            tickSpeed = 1;
            showCommandMessage('Game speed: NORMAL');
        } else {
            showCommandMessage('Options: freeze, slow, normal, fast');
        }
    } else if (cmd === '/fly') {
        flyMode = !flyMode;
        if (flyMode) {
            showCommandMessage('FLY MODE: ON');
        } else {
            showCommandMessage('FLY MODE: OFF');
        }
    } else if (cmd === '/speed') {
        const multiplier = parseFloat(parts[1]);
        if (!isNaN(multiplier) && multiplier > 0) {
            // Set movement speed multiplier
            speedMultiplier = multiplier;
            showCommandMessage(`Movement speed set to ${multiplier}x!`);
        } else {
            showCommandMessage('Invalid speed multiplier');
        }
    } else if (cmd === '/summon') {
        // Summon an NPC at player location
        const randomColor = Math.floor(Math.random() * 0xffffff);
        createNPC(stickMan.position.x + 3, stickMan.position.y, stickMan.position.z + 3, randomColor);
        showCommandMessage('NPC summoned!');
    } else if (cmd === '/rocket') {
        // Summon rocket at player location
        if (rocket) {
            rocket.position.set(stickMan.position.x + 5, stickMan.position.y, stickMan.position.z + 5);
            rocket.visible = true;
        }
        showCommandMessage('Rocket summoned!');
    } else if (cmd === '/ai') {
        // Create AI player that tries to play
        createAIPlayer();
        showCommandMessage('AI player spawned!');
    } else if (cmd === '/size') {
        // Change player size
        const option = parts[1] ? parts[1].toLowerCase() : '';

        if (option === 'small') {
            stickMan.scale.set(0.5, 0.5, 0.5);
            showCommandMessage('Size set to SMALL!');
        } else if (option === 'big') {
            stickMan.scale.set(2, 2, 2);
            showCommandMessage('Size set to BIG!');
        } else if (option === 'normal') {
            stickMan.scale.set(1, 1, 1);
            showCommandMessage('Size set to NORMAL!');
        } else {
            showCommandMessage('Usage: /size [small|big|normal]');
        }
    } else if (cmd === '/everything') {
        // Give AI an instruction to follow
        const instruction = parts.slice(1).join(' ');

        if (!aiPlayer) {
            createAIPlayer();
        }

        if (instruction) {
            aiInstruction = instruction.toLowerCase();
            showCommandMessage('AI instruction: ' + instruction);
        } else {
            aiInstruction = '';
            showCommandMessage('AI instruction cleared!');
        }
    } else {
        showCommandMessage('Unknown command');
    }
}

// Show command message
function showCommandMessage(message) {
    const msgDiv = document.getElementById('commandMessage');
    msgDiv.textContent = message;
    msgDiv.style.opacity = '1';
    setTimeout(() => {
        msgDiv.style.opacity = '0';
    }, 2000);
}

// Start the game when page loads
window.addEventListener('load', init);
