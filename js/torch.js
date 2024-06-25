// TorchBuilder class to manage torch creation and placement
var TorchBuilder = function() {
    // Initial positions for the torch and its light
    this.initialTorchPos = new THREE.Vector3(0.45 * SCALE.x, 0.18 * SCALE.y, 0);
    this.initialLightPos = new THREE.Vector3(0.37 * SCALE.x, (0.18 + 0.2) * SCALE.y, 0);

    // Define torch geometry and material
    // TODO: Too much hard-coded. It depends on the wall sizes, too.
    var torchGeometry = new THREE.BoxGeometry(0.07 * SCALE.x, 0.35 * SCALE.y, 0.07 * SCALE.z);
    var torchMaterial = new THREE.MeshNormalMaterial();

    // Create torch mesh and light
    this.torchMesh = new THREE.Mesh(torchGeometry, torchMaterial);
    this.torchLight = new THREE.PointLight(0xFF6600, 1 * SCALE.average(), 3 * SCALE.average());
    this.geometry = new THREE.Geometry();

    // Array to hold all torches
    this.torches = [];
};

// Method to add a torch at a specific position and angle
TorchBuilder.prototype.addTorch = function(pos, angle) {
    // Ensure pos is a THREE.Vector3 and angle is a number
    if (pos instanceof THREE.Vector3 && typeof angle === 'number') {
        this.torches.push(new Torch(pos, angle, this));
    } else {
        console.warn('Invalid parameters for addTorch. Expected a THREE.Vector3 and a number.');
    }
};

// Method to finalize torch placement and add them to the scene
TorchBuilder.prototype.finish = function() {
    var geom = new THREE.BufferGeometry().fromGeometry(this.geometry);
    geom.computeBoundingSphere();

    var mesh = new THREE.Mesh(geom, this.torchMesh.material);
    scene.add(mesh);
};

// Torch class to represent a single torch
var Torch = function(pos, angle, torchBuilder) {
    // Clone initial positions and create rotation vector
    var torchPos = torchBuilder.initialTorchPos.clone();
    var lightPos = torchBuilder.initialLightPos.clone();
    var rotationVec = new THREE.Vector3(0, 0, 0.39);

    // Rotate positions and vector by the given angle
    torchPos.rotateToY(angle);
    lightPos.rotateToY(angle);
    rotationVec.rotateY(angle);

    // Adjust position by scale
    pos.multiply(SCALE);

    // Add position offsets to the initial positions
    torchPos.add(pos);
    lightPos.add(pos);

    // Create and position the torch mesh
    var torch = torchBuilder.torchMesh.clone();
    torch.position.copy(torchPos);
    torch.rotation.setFromVector3(rotationVec);

    // Merge the torch mesh into the builder's geometry
    torchBuilder.geometry.mergeMesh(torch);

    // Create and position the torch light
    this.light = torchBuilder.torchLight.clone();
    this.light.position.copy(lightPos);
    scene.add(this.light);

    // Uncomment the following lines to add a point light helper for debugging
    // var pointLightHelper = new THREE.PointLightHelper(this.light, 0.01);
    // scene.add(pointLightHelper);
};

/* 
// Method to update torch properties (currently commented out)
// Torch.prototype.update = function(delta) {
//     this.light.intensity = rnd(90, 100) / 100.0;
// };
*/
