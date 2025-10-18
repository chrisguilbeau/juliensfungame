class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            console.log('Key down:', e.key, e.key.toLowerCase());
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            console.log('Key up:', e.key, e.key.toLowerCase());
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('blur', () => {
            console.log('Window lost focus, clearing keys');
            this.keys = {};
        });
        
        console.log('Input event listeners set up');
    }

    isPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }
}

class Controls {
    constructor(inputManager) {
        this.input = inputManager;
        
        this.player1Controls = {
            forward: 'w',
            backward: 's',
            left: 'a',
            right: 'd',
            rotateLeft: 'q',
            rotateRight: 'e',
            fire: ' '
        };

        this.player2Controls = {
            forward: 'arrowup',
            backward: 'arrowdown',
            left: 'arrowleft',
            right: 'arrowright',
            rotateLeft: ',',
            rotateRight: '.',
            fire: 'enter'
        };
    }

    updateShip(ship, playerNum) {
        const controls = playerNum === 1 ? this.player1Controls : this.player2Controls;
        
        ship.thrust = 0;

        // Forward/backward thrust
        if (this.input.isPressed(controls.forward)) {
            console.log(`Player ${playerNum} thrust forward`);
            ship.thrust = 1;
        }
        if (this.input.isPressed(controls.backward)) {
            console.log(`Player ${playerNum} thrust backward`);
            ship.thrust = -0.5;
        }

        // Lateral movement (strafe)
        if (this.input.isPressed(controls.left)) {
            ship.velocity = ship.velocity.add(
                new Vector3D(-1, 0, 0)
                    .rotateX(ship.rotation.x)
                    .rotateY(ship.rotation.y)
                    .rotateZ(ship.rotation.z)
                    .multiply(0.15)
            );
        }
        if (this.input.isPressed(controls.right)) {
            ship.velocity = ship.velocity.add(
                new Vector3D(1, 0, 0)
                    .rotateX(ship.rotation.x)
                    .rotateY(ship.rotation.y)
                    .rotateZ(ship.rotation.z)
                    .multiply(0.15)
            );
        }

        // Rotation controls - now proper 3D rotation
        if (this.input.isPressed(controls.rotateLeft)) {
            ship.rotation.z += ship.rotationSpeed; // Roll left
        }
        if (this.input.isPressed(controls.rotateRight)) {
            ship.rotation.z -= ship.rotationSpeed; // Roll right
        }

        // Additional 3D controls for player 1
        if (playerNum === 1) {
            if (this.input.isPressed('r')) {
                ship.rotation.x += ship.rotationSpeed; // Pitch up
            }
            if (this.input.isPressed('f')) {
                ship.rotation.x -= ship.rotationSpeed; // Pitch down
            }
            if (this.input.isPressed('t')) {
                ship.rotation.y += ship.rotationSpeed; // Yaw left
            }
            if (this.input.isPressed('g')) {
                ship.rotation.y -= ship.rotationSpeed; // Yaw right
            }
        }
        
        // Additional 3D controls for player 2
        if (playerNum === 2) {
            if (this.input.isPressed('/')) {
                ship.rotation.x += ship.rotationSpeed; // Pitch up
            }
            if (this.input.isPressed('shift')) {
                ship.rotation.x -= ship.rotationSpeed; // Pitch down
            }
            if (this.input.isPressed(']')) {
                ship.rotation.y += ship.rotationSpeed; // Yaw left
            }
            if (this.input.isPressed('[')) {
                ship.rotation.y -= ship.rotationSpeed; // Yaw right
            }
        }

        if (this.input.isPressed(controls.fire)) {
            ship.fire();
        }
    }
}