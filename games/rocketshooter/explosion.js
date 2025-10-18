class Explosion {
    constructor(x, y, shipShape) {
        this.position = new Vector2(x, y);
        this.fragments = [];
        this.lifeTime = 2.0; // seconds
        this.age = 0;
        this.isActive = true;
        
        // Create fragments from ship shape
        this.createFragments(shipShape);
    }
    
    createFragments(shipShape) {
        // Break the ship into line segments that fly apart
        const allPoints = [...shipShape.body, ...shipShape.nose];
        
        // Create fragments from connected line segments
        for (let i = 0; i < allPoints.length; i++) {
            const start = allPoints[i];
            const end = allPoints[(i + 1) % allPoints.length];
            
            // Calculate fragment properties
            const center = start.add(end).multiply(0.5);
            const velocity = center.subtract(this.position).normalize().multiply(100 + Math.random() * 100);
            const angularVelocity = (Math.random() - 0.5) * 10; // radians per second
            
            this.fragments.push({
                start: start.clone(),
                end: end.clone(),
                originalStart: start.clone(),
                originalEnd: end.clone(),
                center: center.clone(),
                velocity: velocity,
                angularVelocity: angularVelocity,
                rotation: 0
            });
        }
        
        // Add some extra debris fragments
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 8 + Math.random() * 8;
            const start = this.position.add(new Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance));
            const end = start.add(new Vector2(Math.cos(angle) * 6, Math.sin(angle) * 6));
            
            const velocity = new Vector2(Math.cos(angle), Math.sin(angle)).multiply(80 + Math.random() * 60);
            const angularVelocity = (Math.random() - 0.5) * 15;
            
            this.fragments.push({
                start: start.clone(),
                end: end.clone(),
                originalStart: start.clone(),
                originalEnd: end.clone(),
                center: start.add(end).multiply(0.5),
                velocity: velocity,
                angularVelocity: angularVelocity,
                rotation: 0
            });
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        if (this.age >= this.lifeTime) {
            this.isActive = false;
            return;
        }
        
        // Update each fragment
        for (const fragment of this.fragments) {
            // Update position
            fragment.center = fragment.center.add(fragment.velocity.multiply(deltaTime));
            
            // Update rotation
            fragment.rotation += fragment.angularVelocity * deltaTime;
            
            // Calculate rotated line segment
            const localStart = fragment.originalStart.subtract(fragment.originalStart.add(fragment.originalEnd).multiply(0.5));
            const localEnd = fragment.originalEnd.subtract(fragment.originalStart.add(fragment.originalEnd).multiply(0.5));
            
            fragment.start = fragment.center.add(localStart.rotate(fragment.rotation));
            fragment.end = fragment.center.add(localEnd.rotate(fragment.rotation));
            
            // Apply drag
            fragment.velocity = fragment.velocity.multiply(0.95);
        }
    }
    
    getFragments() {
        return this.fragments;
    }
    
    getAlpha() {
        // Fade out over time
        return Math.max(0, 1 - (this.age / this.lifeTime));
    }
}