// Vector2 Tests
function testVector2Creation() {
    const v = new Vector2(3, 4);
    assertEqual(v.x, 3);
    assertEqual(v.y, 4);
}

function testVector2Addition() {
    const v1 = new Vector2(1, 2);
    const v2 = new Vector2(3, 4);
    const result = v1.add(v2);
    assertEqual(result.x, 4);
    assertEqual(result.y, 6);
}

function testVector2Length() {
    const v = new Vector2(3, 4);
    assertEqual(v.length(), 5);
}

function testVector2Normalize() {
    const v = new Vector2(3, 4);
    const normalized = v.normalize();
    assertApproxEqual(normalized.length(), 1);
    assertApproxEqual(normalized.x, 0.6);
    assertApproxEqual(normalized.y, 0.8);
}

function testVector2Rotation() {
    const v = new Vector2(1, 0);
    const rotated = v.rotate(Math.PI / 2);
    assertApproxEqual(rotated.x, 0, 0.001);
    assertApproxEqual(rotated.y, 1, 0.001);
}

// Ship Tests
function testShipCreation() {
    const ship = new Ship(10, 20);
    assertEqual(ship.position.x, 10);
    assertEqual(ship.position.y, 20);
    assertEqual(ship.velocity.x, 0);
    assertEqual(ship.velocity.y, 0);
    assertEqual(ship.rotation, 0);
    assertEqual(ship.fireRate, 0.15);
}

function testShipRotation() {
    const ship = new Ship();
    ship.setControl('left', true);
    ship.update(0.1, 0.1);
    assertTrue(ship.rotation < 0, 'Ship should rotate left (negative)');
    
    ship.setControl('left', false);
    ship.setControl('right', true);
    const oldRotation = ship.rotation;
    ship.update(0.1, 0.2);
    assertTrue(ship.rotation > oldRotation, 'Ship should rotate right (positive)');
}

function testShipThrust() {
    const ship = new Ship();
    ship.setControl('thrust', true);
    ship.update(0.1, 0.1);
    assertTrue(ship.velocity.length() > 0, 'Ship should have velocity after thrust');
    assertTrue(ship.isThrusting, 'Ship should be marked as thrusting');
}

function testShipDrag() {
    const ship = new Ship();
    ship.velocity = new Vector2(100, 0);
    ship.update(0.1, 0.1);
    assertTrue(ship.velocity.length() < 100, 'Ship should slow down due to drag');
}

function testShipForwardVector() {
    const ship = new Ship();
    const forward = ship.getForwardVector();
    assertApproxEqual(forward.x, 0);
    assertApproxEqual(forward.y, -1);
    
    ship.rotation = Math.PI / 2;
    const forwardRotated = ship.getForwardVector();
    assertApproxEqual(forwardRotated.x, 1, 0.001);
    assertApproxEqual(forwardRotated.y, 0, 0.001);
}

// Starfield Tests
function testStarfieldConsistency() {
    const starfield = new Starfield();
    const stars1 = starfield.generateStarsForSection(0, 0);
    const stars2 = starfield.generateStarsForSection(0, 0);
    
    assertEqual(stars1.length, stars2.length);
    for (let i = 0; i < stars1.length; i++) {
        assertEqual(stars1[i].x, stars2[i].x);
        assertEqual(stars1[i].y, stars2[i].y);
        assertEqual(stars1[i].brightness, stars2[i].brightness);
    }
}

function testStarfieldDifferentSections() {
    const starfield = new Starfield();
    const stars1 = starfield.generateStarsForSection(0, 0);
    const stars2 = starfield.generateStarsForSection(1, 0);
    
    // Should be different star patterns
    let different = false;
    for (let i = 0; i < Math.min(stars1.length, stars2.length); i++) {
        if (stars1[i].x !== stars2[i].x || stars1[i].y !== stars2[i].y) {
            different = true;
            break;
        }
    }
    assertTrue(different, 'Different sections should have different star patterns');
}

function testStarfieldVisibleStars() {
    const starfield = new Starfield();
    const stars = starfield.getVisibleStars(0, 0, 200, 200);
    
    assertTrue(stars.length > 0, 'Should have visible stars');
    
    // All stars should be within the visible area
    for (const star of stars) {
        assertTrue(star.x >= -100 && star.x <= 100, 'Star X should be in visible range');
        assertTrue(star.y >= -100 && star.y <= 100, 'Star Y should be in visible range');
    }
}

// Projectile Tests
function testProjectileCreation() {
    const direction = new Vector2(0, -1);
    const projectile = new Projectile(10, 20, direction, 0);
    assertEqual(projectile.position.x, 10);
    assertEqual(projectile.position.y, 20);
    assertEqual(projectile.velocity.x, 0);
    assertEqual(projectile.velocity.y, -800);
    assertTrue(projectile.isActive);
}

function testProjectileMovement() {
    const direction = new Vector2(1, 0);
    const projectile = new Projectile(0, 0, direction, 0);
    projectile.update(0.1);
    assertEqual(projectile.position.x, 80);
    assertEqual(projectile.position.y, 0);
}

function testProjectileLifetime() {
    const direction = new Vector2(0, -1);
    const projectile = new Projectile(0, 0, direction, 0);
    projectile.update(3.1); // Exceed lifetime
    assertFalse(projectile.isActive, 'Projectile should be inactive after lifetime');
}

function testShipShooting() {
    const ship = new Ship();
    ship.setControl('shoot', true);
    
    const projectiles = ship.update(0.1, 0.2);
    assertNotNull(projectiles, 'Ship should create projectiles when shooting');
    assertTrue(Array.isArray(projectiles), 'Should return an array of projectiles');
    assertEqual(projectiles.length, 1, 'Should fire one projectile by default');
    
    // Test fire rate limit
    const projectiles2 = ship.update(0.01, 0.21);
    assertEqual(projectiles2, null, 'Ship should not fire again immediately due to fire rate');
    
    // Test fire rate allows shooting again
    const projectiles3 = ship.update(0.1, 0.4);
    assertNotNull(projectiles3, 'Ship should fire again after fire rate delay');
}

// PowerUp Tests
function testPowerUpCreation() {
    const powerUp = new PowerUp('S', 2);
    assertEqual(powerUp.type, 'S');
    assertEqual(powerUp.level, 2);
    assertEqual(powerUp.maxLevel, 8);
    assertTrue(powerUp.canUpgrade());
}

function testPowerUpUpgrade() {
    const powerUp = new PowerUp('F', 3);
    assertFalse(powerUp.canUpgrade(), 'F level 3 should be max level');
    
    const powerUp2 = new PowerUp('S', 1);
    assertTrue(powerUp2.canUpgrade());
    assertTrue(powerUp2.upgrade());
    assertEqual(powerUp2.level, 2);
}

function testWeaponStationCreation() {
    const station = new WeaponStation(100, 200, 'S');
    assertEqual(station.position.x, 100);
    assertEqual(station.position.y, 200);
    assertEqual(station.powerUpType, 'S');
    assertTrue(station.isActive);
}

function testWeaponStationCollision() {
    const station = new WeaponStation(100, 100, 'S');
    const ship = new Ship(100, 100);
    
    assertTrue(station.checkCollision(ship), 'Ship should collide with station at same position');
    
    const ship2 = new Ship(200, 200);
    assertFalse(station.checkCollision(ship2), 'Ship should not collide with distant station');
}

function testShipPowerUpSystem() {
    const ship = new Ship();
    const powerUp = new PowerUp('S', 1);
    
    ship.addPowerUp(powerUp);
    assertTrue(ship.powerUps.has('S'), 'Ship should have S powerup');
    assertEqual(ship.powerUps.get('S').level, 1);
    
    // Test upgrade
    const powerUp2 = new PowerUp('S', 1);
    ship.addPowerUp(powerUp2);
    assertEqual(ship.powerUps.get('S').level, 2, 'Should upgrade existing powerup');
}

function testShipMultiDirectionalShooting() {
    const ship = new Ship();
    const powerUp = new PowerUp('S', 2);
    ship.addPowerUp(powerUp);
    
    ship.setControl('shoot', true);
    const projectiles = ship.update(0.1, 0.2);
    
    assertTrue(projectiles.length > 1, 'Should fire multiple projectiles with S powerup');
    assertEqual(projectiles.length, 3, 'S level 2 should fire 3 projectiles (forward, back, right)');
}

function testShipFasterPowerUp() {
    const ship = new Ship();
    const baseThrust = ship.maxThrust;
    
    const powerUp = new PowerUp('F', 2);
    ship.addPowerUp(powerUp);
    
    assertTrue(ship.maxThrust > baseThrust, 'F powerup should increase thrust');
    assertEqual(ship.maxThrust, baseThrust * 2, 'F level 2 should double thrust');
}

// Enemy Tests
function testEnemyCreation() {
    const enemy = new Enemy(100, 200, 'small');
    assertEqual(enemy.position.x, 100);
    assertEqual(enemy.position.y, 200);
    assertEqual(enemy.type, 'small');
    assertEqual(enemy.health, 1);
    assertTrue(enemy.isActive);
    
    const largeEnemy = new Enemy(0, 0, 'large');
    assertEqual(largeEnemy.health, 3);
    assertTrue(largeEnemy.size > enemy.size);
}

function testEnemyMovement() {
    const enemy = new Enemy(0, 0, 'small');
    const startPos = enemy.position.clone();
    
    enemy.update(0.1, new Vector2(0, 0));
    
    assertTrue(enemy.position.x !== startPos.x || enemy.position.y !== startPos.y, 'Enemy should have moved');
}

function testEnemyDamage() {
    const enemy = new Enemy(0, 0, 'large');
    assertEqual(enemy.health, 3);
    
    let destroyed = enemy.takeDamage(1);
    assertEqual(enemy.health, 2);
    assertFalse(destroyed, 'Enemy should not be destroyed yet');
    
    destroyed = enemy.takeDamage(2);
    assertEqual(enemy.health, 0);
    assertTrue(destroyed, 'Enemy should be destroyed');
    assertFalse(enemy.isActive, 'Enemy should be inactive');
}

function testEnemyShooting() {
    const enemy = new Enemy(0, 0, 'small');
    const playerPos = new Vector2(100, 0);
    
    // Force shooting by setting age
    enemy.age = enemy.shootInterval;
    
    const projectile = enemy.update(0.1, playerPos);
    
    if (projectile) {
        assertTrue(projectile instanceof EnemyProjectile, 'Should create EnemyProjectile');
        assertTrue(projectile.isEnemyProjectile, 'Should be marked as enemy projectile');
    }
}

function testEnemyProjectileMovement() {
    const direction = new Vector2(1, 0);
    const projectile = new EnemyProjectile(0, 0, direction);
    
    projectile.update(0.1);
    assertEqual(projectile.position.x, 40); // 400 * 0.1
    assertEqual(projectile.position.y, 0);
}

function testExplosionCreation() {
    const ship = new Ship();
    const shipShape = ship.getShape();
    const explosion = new Explosion(0, 0, shipShape);
    
    assertTrue(explosion.isActive);
    assertTrue(explosion.fragments.length > 0);
    assertApproxEqual(explosion.getAlpha(), 1.0, 0.1);
}

function testExplosionFading() {
    const ship = new Ship();
    const shipShape = ship.getShape();
    const explosion = new Explosion(0, 0, shipShape);
    
    explosion.update(1.0); // 1 second into 2 second lifetime
    assertApproxEqual(explosion.getAlpha(), 0.5, 0.1);
    
    explosion.update(1.1); // Past lifetime
    assertFalse(explosion.isActive);
}

function testShipDestruction() {
    const ship = new Ship();
    assertTrue(ship.isAlive);
    
    const explosion = ship.destroy();
    assertFalse(ship.isAlive);
    assertTrue(explosion instanceof Explosion);
}

// Integration Tests
function testShipPhysicsIntegration() {
    const ship = new Ship();
    
    // Test combined rotation and thrust
    ship.setControl('right', true);
    ship.setControl('thrust', true);
    
    for (let i = 0; i < 10; i++) {
        ship.update(0.016, i * 0.016); // ~60 FPS
    }
    
    assertTrue(ship.rotation > 0, 'Ship should have rotated');
    assertTrue(ship.velocity.length() > 0, 'Ship should have velocity');
    assertTrue(ship.position.length() > 0, 'Ship should have moved');
}

// Run all tests
const runner = new TestRunner();

// Vector2 tests
runner.test('Vector2 Creation', testVector2Creation);
runner.test('Vector2 Addition', testVector2Addition);
runner.test('Vector2 Length', testVector2Length);
runner.test('Vector2 Normalize', testVector2Normalize);
runner.test('Vector2 Rotation', testVector2Rotation);

// Ship tests
runner.test('Ship Creation', testShipCreation);
runner.test('Ship Rotation', testShipRotation);
runner.test('Ship Thrust', testShipThrust);
runner.test('Ship Drag', testShipDrag);
runner.test('Ship Forward Vector', testShipForwardVector);

// Starfield tests
runner.test('Starfield Consistency', testStarfieldConsistency);
runner.test('Starfield Different Sections', testStarfieldDifferentSections);
runner.test('Starfield Visible Stars', testStarfieldVisibleStars);

// Projectile tests
runner.test('Projectile Creation', testProjectileCreation);
runner.test('Projectile Movement', testProjectileMovement);
runner.test('Projectile Lifetime', testProjectileLifetime);
runner.test('Ship Shooting', testShipShooting);

// PowerUp tests
runner.test('PowerUp Creation', testPowerUpCreation);
runner.test('PowerUp Upgrade', testPowerUpUpgrade);
runner.test('WeaponStation Creation', testWeaponStationCreation);
runner.test('WeaponStation Collision', testWeaponStationCollision);
runner.test('Ship PowerUp System', testShipPowerUpSystem);
runner.test('Ship Multi-Directional Shooting', testShipMultiDirectionalShooting);
runner.test('Ship Faster PowerUp', testShipFasterPowerUp);

// Enemy tests
runner.test('Enemy Creation', testEnemyCreation);
runner.test('Enemy Movement', testEnemyMovement);
runner.test('Enemy Damage', testEnemyDamage);
runner.test('Enemy Shooting', testEnemyShooting);
runner.test('Enemy Projectile Movement', testEnemyProjectileMovement);
runner.test('Explosion Creation', testExplosionCreation);
runner.test('Explosion Fading', testExplosionFading);
runner.test('Ship Destruction', testShipDestruction);

// Integration tests
runner.test('Ship Physics Integration', testShipPhysicsIntegration);

// Auto-run tests when page loads
window.addEventListener('load', async () => {
    await runner.run();
    runner.displayResults();
});