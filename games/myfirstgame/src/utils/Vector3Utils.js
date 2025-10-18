class Vector3Utils {
    static distance(v1, v2) {
        return Math.sqrt(
            Math.pow(v2.x - v1.x, 2) + 
            Math.pow(v2.y - v1.y, 2) + 
            Math.pow(v2.z - v1.z, 2)
        );
    }
    
    static normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
    }
    
    static multiply(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar,
            z: vector.z * scalar
        };
    }
    
    static add(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vector3Utils;
} else if (typeof window !== 'undefined') {
    window.Vector3Utils = Vector3Utils;
}