class InputSystem {
    constructor() {
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                this.mouseMovement.x = event.movementX || 0;
                this.mouseMovement.y = event.movementY || 0;
            }
        });
        
        document.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
        });
    }
    
    getMovementVector() {
        const movement = { x: 0, y: 0, z: 0 };
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            movement.z -= 1;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            movement.z += 1;
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            movement.x -= 1;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            movement.x += 1;
        }
        
        return movement;
    }
    
    isAttackPressed() {
        return this.keys['Space'];
    }
    
    getMouseMovement() {
        const movement = { ...this.mouseMovement };
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
        return movement;
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputSystem;
} else if (typeof window !== 'undefined') {
    window.InputSystem = InputSystem;
}