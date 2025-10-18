let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});

window.addEventListener('beforeunload', () => {
    if (game) {
        // Cleanup if needed
    }
});