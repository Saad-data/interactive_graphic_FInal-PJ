// XR Controls for interacting with the game world in VR
var XRControls = function(game, objectsToIntersectWith) {
    this.g = game;
    this.activeControllers = [];
    this.geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    this.objectsToIntersectWith = objectsToIntersectWith;
    this.controllerToCheck = 0;
};

// Initialize the controllers
XRControls.prototype.init = function() {
    var controllerMesh = new THREE.Mesh(
        new THREE.CubeGeometry(0.04, 0.04, 0.08),
        new THREE.MeshBasicMaterial({ wireframe: true })
    );

    var self = this;

    var selectstart = function(evnt) {
        // Handle select start event
    };

    var selectend = function(evnt) {
        self.attemptTeleport(evnt.target);
    };

    var conn = function(evnt) {
        this.add(controllerMesh.clone());
        var line = new THREE.Line(self.geom);
        line.scale.z = 0;
        line.scale.y = .2;
        line.scale.x = .2;
        this.add(line);
        self.activeControllers.push(this);
    };

    var disconn = function(evnt) {
        this.remove(this.children[1]);
        this.remove(this.children[0]);
        var controller = this;
        self.activeControllers.splice(self.activeControllers.findIndex(j => j.uuid === controller.uuid), 1);
    };

    for (var i = 0; i < 2; i++) {
        var c = renderer.xr.getController(i);
        c.raycaster = new THREE.Raycaster();
        c.raycaster.near = 0.1;

        c.addEventListener("connected", conn);
        c.addEventListener("disconnect", disconn);
        c.addEventListener("selectstart", selectstart);
        c.addEventListener("selectend", selectend);

        this.g.dolly.add(c);
        this.g.controllers.push(c);
    }
};

// Attempt to teleport the player
XRControls.prototype.attemptTeleport = function(c) {
    var ints = this.getIntersections(c, this.objectsToIntersectWith);
    if (ints.length === 0 || ints[0].distance < 0.25 || ints[0].object.uuid === this.objectsToIntersectWith[0].uuid) {
        return false;
    }
    var headPosition = this.g.player.position;
    var diff = ints[0].point.clone().sub(headPosition);
    diff.y = 0; // Don't move the y of the head
    this.g.player.position.add(diff);
};

// Get intersections for teleportation
XRControls.prototype.getIntersections = function(c, mesh) {
    var mat = new THREE.Matrix4().identity().extractRotation(c.matrixWorld);
    c.raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
    c.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(mat);
    if (Array.isArray(mesh)) {
        return c.raycaster.intersectObjects(mesh);
    } else {
        return c.raycaster.intersectObject(mesh);
    }
};

// Update the controller states
XRControls.prototype.update = function(delta) {
    if (this.activeControllers.length === 0) return;
    var c = this.activeControllers[this.controllerToCheck];
    var ints = this.getIntersections(c, this.objectsToIntersectWith);
    if (ints.length === 0 || ints[0].distance < 0.25 || ints[0].object.uuid === this.objectsToIntersectWith[0].uuid) {
        c.children[1].scale.z = 0;
        c.children[0].material.color.setHex(0xffffff);
    } else {
        c.children[1].scale.z = ints[0].distance;
        c.children[0].material.color.setHex(0x88ff88);
    }
    if (++this.controllerToCheck >= this.activeControllers.length) {
        this.controllerToCheck = 0;
    }
};
