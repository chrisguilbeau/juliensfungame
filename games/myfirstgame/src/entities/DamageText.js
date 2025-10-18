class DamageText {
    constructor(scene, position, damage) {
        this.scene = scene;
        this.startTime = Date.now();
        this.duration = 1500; // 1.5 seconds
        this.startPosition = { ...position };
        this.isActive = true;
        
        // Batman-style comic book words
        this.comicWords = [
            'BAM!', 'POW!', 'WHAM!', 'ZAP!', 'THWACK!',
            'KAPOW!', 'BIFF!', 'SOCK!', 'WHAP!', 'SMACK!',
            'BOOM!', 'CRASH!', 'BASH!', 'SLAM!', 'WHACK!',
            'OUCH!', 'OOF!', 'BONK!', 'CLONK!', 'THUD!',
            'ZOWIE!', 'BOOF!', 'CRACK!', 'SNAP!', 'WHOMP!'
        ];
        
        this.createTextMesh(damage);
    }
    
    createTextMesh(damage) {
        // Create a canvas to draw the text
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        
        // Pick a random comic word
        const text = this.comicWords[Math.floor(Math.random() * this.comicWords.length)];
        
        // Draw comic book style text with bold outline
        ctx.fillStyle = '#FFD700'; // Gold color
        ctx.strokeStyle = '#FF0000'; // Red outline for comic effect
        ctx.lineWidth = 4;
        ctx.font = 'bold 32px Impact, Arial Black, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow for depth
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });
        
        // Create plane geometry for the text (bigger for comic words)
        const geometry = new THREE.PlaneGeometry(2, 0.8);
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position the text above the enemy
        this.mesh.position.set(
            this.startPosition.x,
            this.startPosition.y + 1,
            this.startPosition.z
        );
        
        // Make the text always face the camera
        this.mesh.lookAt(this.scene.children.find(child => child.isCamera) || { position: { x: 0, y: 5, z: 8 } });
        
        this.scene.add(this.mesh);
    }
    
    update(camera) {
        if (!this.isActive) return false;
        
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        
        if (progress >= 1) {
            this.destroy();
            return false;
        }
        
        // Float upward
        const floatHeight = progress * 2; // Float up 2 units
        this.mesh.position.y = this.startPosition.y + 1 + floatHeight;
        
        // Fade out
        const alpha = 1 - progress;
        this.mesh.material.opacity = alpha;
        
        // Scale down slightly
        const scale = 1 - progress * 0.3;
        this.mesh.scale.set(scale, scale, scale);
        
        // Always face the camera
        if (camera) {
            this.mesh.lookAt(camera.position);
        }
        
        return true;
    }
    
    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                if (this.mesh.material.map) {
                    this.mesh.material.map.dispose();
                }
                this.mesh.material.dispose();
            }
            this.mesh = null;
        }
        this.isActive = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DamageText;
} else if (typeof window !== 'undefined') {
    window.DamageText = DamageText;
}