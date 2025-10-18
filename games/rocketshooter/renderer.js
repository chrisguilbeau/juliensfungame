class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.camera = new Vector2(0, 0);
    }
    
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    setCamera(x, y) {
        this.camera.x = x;
        this.camera.y = y;
    }
    
    worldToScreen(worldPos) {
        return new Vector2(
            worldPos.x - this.camera.x + this.width / 2,
            worldPos.y - this.camera.y + this.height / 2
        );
    }
    
    screenToWorld(screenPos) {
        return new Vector2(
            screenPos.x - this.width / 2 + this.camera.x,
            screenPos.y - this.height / 2 + this.camera.y
        );
    }
    
    drawLine(start, end, color = '#fff', width = 1) {
        const screenStart = this.worldToScreen(start);
        const screenEnd = this.worldToScreen(end);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(screenStart.x, screenStart.y);
        this.ctx.lineTo(screenEnd.x, screenEnd.y);
        this.ctx.stroke();
    }
    
    drawPolygon(points, color = '#fff', fill = false, width = 1) {
        if (points.length < 2) return;
        
        const screenPoints = points.map(p => this.worldToScreen(p));
        
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        
        this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
            this.ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        this.ctx.closePath();
        
        if (fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }
    
    drawCircle(center, radius, color = '#fff', fill = false, width = 1) {
        const screenCenter = this.worldToScreen(center);
        
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.arc(screenCenter.x, screenCenter.y, radius, 0, Math.PI * 2);
        
        if (fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }
    
    drawShip(ship) {
        const shape = ship.getShape();
        
        // Draw ship body
        this.drawPolygon(shape.body, '#fff', false, 2);
        
        // Draw nose
        this.drawPolygon(shape.nose, '#fff', false, 2);
        
        // Draw thruster flames
        if (shape.thruster.length > 0) {
            for (const line of shape.thruster) {
                this.drawLine(line[0], line[1], '#ff6600', 2);
            }
        }
    }
    
    drawProjectile(projectile) {
        if (!projectile.isActive) return;
        
        const shape = projectile.getShape();
        this.drawLine(shape.start, shape.end, '#fff', 2);
    }
    
    drawWeaponStation(station) {
        if (!station.isActive) return;
        
        const screenPos = this.worldToScreen(station.position);
        const color = station.getColor();
        
        // Draw main circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, station.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, station.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw powerup type letter
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(station.powerUpType, screenPos.x, screenPos.y);
    }
    
    drawEnemy(enemy) {
        if (!enemy.isActive) return;
        
        const shape = enemy.getShape();
        const color = enemy.type === 'large' ? '#ffaa00' : '#ff6666';
        
        // Draw main body
        this.drawPolygon(shape.body, color, false, 2);
        
        // Draw dome
        this.drawPolygon(shape.dome, color, false, 1);
        
        // Draw detail lines
        for (const line of shape.details) {
            this.drawLine(line[0], line[1], color, 1);
        }
        
        // Draw health indicator for large enemies
        if (enemy.type === 'large' && enemy.health < enemy.maxHealth) {
            const screenPos = this.worldToScreen(enemy.position);
            const barWidth = 30;
            const barHeight = 4;
            const healthRatio = enemy.health / enemy.maxHealth;
            
            // Background
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - enemy.size/2 - 10, barWidth, barHeight);
            
            // Health bar
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - enemy.size/2 - 10, barWidth * healthRatio, barHeight);
        }
    }
    
    drawEnemyProjectile(projectile) {
        if (!projectile.isActive) return;
        
        const shape = projectile.getShape();
        this.drawLine(shape.start, shape.end, '#ff4444', 2);
    }
    
    drawExplosion(explosion) {
        if (!explosion.isActive) return;
        
        const alpha = explosion.getAlpha();
        const fragments = explosion.getFragments();
        
        for (const fragment of fragments) {
            const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.drawLine(fragment.start, fragment.end, `#fff${alphaHex}`, 1);
        }
    }
    
    drawStars(stars) {
        for (const star of stars) {
            const alpha = Math.floor(star.brightness * 255).toString(16).padStart(2, '0');
            this.drawCircle(new Vector2(star.x, star.y), 1, `#fff${alpha}`, true);
        }
    }
    
    drawGridLines(gridLines) {
        for (const line of gridLines) {
            if (line.type === 'vertical') {
                this.drawLine(
                    new Vector2(line.x, line.y1),
                    new Vector2(line.x, line.y2),
                    '#333',
                    1
                );
            } else if (line.type === 'horizontal') {
                this.drawLine(
                    new Vector2(line.x1, line.y),
                    new Vector2(line.x2, line.y),
                    '#333',
                    1
                );
            }
        }
    }
    
    getViewportBounds() {
        const topLeft = this.screenToWorld(new Vector2(0, 0));
        const bottomRight = this.screenToWorld(new Vector2(this.width, this.height));
        
        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
            centerX: this.camera.x,
            centerY: this.camera.y
        };
    }
}