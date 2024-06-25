// Constants
Math.TAU = Math.PI * 2.0;

const Direction = {
    North: 1,
    East: 0,
    South: 3,
    West: 2
};

// Convert direction to angle in radians
const DirectionToAngle = dir => Math.TAU * dir / 4;

// Extend THREE.Vector3 with rotation methods
THREE.Vector3.prototype.rotateToY = function(theta) {
    const ox = this.x;
    const oz = this.z;
    this.x = ox * Math.cos(theta) - oz * Math.sin(theta);
    this.z = ox * Math.sin(theta) + oz * Math.cos(theta);
    return this;
};

THREE.Vector3.prototype.rotateY = function(theta) {
    const s = Math.sin(theta);
    const c = Math.cos(theta);
    const ox = this.x, oz = this.z;
    this.x = ox * c - oz * s;
    this.z = oz * c + ox * s;
    return this;
};

// Calculate the average of the vector's components
THREE.Vector3.prototype.average = function() {
    return (this.x + this.y + this.z) / 3;
};

// Clamp rotation value between 0 and 2*PI
const rotclamp = r => {
    r %= Math.TAU;
    if (r < 0) r += Math.TAU;
    return r;
};
