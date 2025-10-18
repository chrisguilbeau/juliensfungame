// Simple debug renderer to troubleshoot the black screen issue
class SimpleGame {
    constructor() {
        this.player1Canvas = document.getElementById('player1-canvas');
        this.player2Canvas = document.getElementById('player2-canvas');
        
        this.ctx1 = this.player1Canvas.getContext('2d');
        this.ctx2 = this.player2Canvas.getContext('2d');
        
        this.inputManager = new InputManager();
        this.controls = new Controls(this.inputManager);
        
        this.ship1 = { 
            position: new Vector3D(-50, 0, 100),
            rotation: new Vector3D(0, 0, 0),
            velocity: new Vector3D(0, 0, 0),
            thrust: 0,
            lives: 5
        };
        this.ship2 = {
            position: new Vector3D(50, 0, -100),
            rotation: new Vector3D(0, 0, 0),
            velocity: new Vector3D(0, 0, 0),
            thrust: 0,
            lives: 5
        };
        
        console.log('SimpleGame initialized');
        this.gameLoop();
    }

    update() {
        // Simple movement test
        if (this.inputManager.isPressed('w')) {
            this.ship1.position.y += 2;
            console.log('Ship1 moved forward', this.ship1.position);
        }
        if (this.inputManager.isPressed('s')) {
            this.ship1.position.y -= 2;
        }
        if (this.inputManager.isPressed('a')) {
            this.ship1.position.x -= 2;
        }
        if (this.inputManager.isPressed('d')) {
            this.ship1.position.x += 2;
        }
        
        if (this.inputManager.isPressed('arrowup')) {
            this.ship2.position.y += 2;
            console.log('Ship2 moved forward', this.ship2.position);
        }
        if (this.inputManager.isPressed('arrowdown')) {
            this.ship2.position.y -= 2;
        }
        if (this.inputManager.isPressed('arrowleft')) {
            this.ship2.position.x -= 2;
        }
        if (this.inputManager.isPressed('arrowright')) {
            this.ship2.position.x += 2;
        }
    }

    render() {
        // Clear canvases
        this.ctx1.clearRect(0, 0, this.player1Canvas.width, this.player1Canvas.height);
        this.ctx2.clearRect(0, 0, this.player2Canvas.width, this.player2Canvas.height);
        
        // Simple 2D projection for testing
        const centerX1 = this.player1Canvas.width / 2;
        const centerY1 = this.player1Canvas.height / 2;
        const centerX2 = this.player2Canvas.width / 2;
        const centerY2 = this.player2Canvas.height / 2;
        
        // Draw ships as simple circles
        this.ctx1.fillStyle = '#0f0';
        this.ctx1.beginPath();
        this.ctx1.arc(centerX1 + this.ship1.position.x, centerY1 - this.ship1.position.y, 10, 0, Math.PI * 2);
        this.ctx1.fill();
        
        this.ctx1.fillStyle = '#f0f';
        this.ctx1.beginPath();
        this.ctx1.arc(centerX1 + this.ship2.position.x, centerY1 - this.ship2.position.y, 8, 0, Math.PI * 2);
        this.ctx1.fill();
        
        // Same for second canvas
        this.ctx2.fillStyle = '#0f0';
        this.ctx2.beginPath();
        this.ctx2.arc(centerX2 + this.ship1.position.x, centerY2 - this.ship1.position.y, 8, 0, Math.PI * 2);
        this.ctx2.fill();
        
        this.ctx2.fillStyle = '#f0f';
        this.ctx2.beginPath();
        this.ctx2.arc(centerX2 + this.ship2.position.x, centerY2 - this.ship2.position.y, 10, 0, Math.PI * 2);
        this.ctx2.fill();
        
        // Draw debug info
        this.ctx1.fillStyle = '#0f0';
        this.ctx1.font = '14px Courier New';
        this.ctx1.fillText(`Ship1: (${Math.round(this.ship1.position.x)}, ${Math.round(this.ship1.position.y)})`, 10, 30);
        this.ctx1.fillText(`Ship2: (${Math.round(this.ship2.position.x)}, ${Math.round(this.ship2.position.y)})`, 10, 50);
        
        this.ctx2.fillStyle = '#f0f';
        this.ctx2.font = '14px Courier New';
        this.ctx2.fillText(`Ship1: (${Math.round(this.ship1.position.x)}, ${Math.round(this.ship1.position.y)})`, 10, 30);
        this.ctx2.fillText(`Ship2: (${Math.round(this.ship2.position.x)}, ${Math.round(this.ship2.position.y)})`, 10, 50);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Override the original game for debugging
function startGame() {
    console.log('Starting debug game...');
    window.debugGame = new SimpleGame();
}