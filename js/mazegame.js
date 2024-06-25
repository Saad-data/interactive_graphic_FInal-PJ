// Initialize scale vector
var SCALE = new THREE.Vector3(1, 1, 1); // TODO: Fix that SCALE.x needs to equal SCALE.z

// Game constructor function
var Game = function(args) {
    this.controllers = [];

    // Set scale if provided
    if (args.scale) {
        SCALE.copy(args.scale);
    }

    // Calculate average scale for X and Z dimensions
    var avgScaleXZ = (SCALE.x + SCALE.z) / 2;
    
    // Check for hacks mode
    this.hacks = !!args.hacks || false;

    // Initialize player properties
    this.player = {
        position: new THREE.Vector3(-1.5, 0.1, 1).multiply(SCALE),
        theta: Math.PI * 1.5,
        phi: 0
    };

    // Initialize assets and lights
    Asset.init();
    var light = new THREE.AmbientLight(0x808080);
    scene.add(light);

    // Initialize player's light
    this.player.light = new THREE.PointLight(0xF5D576, 0.5 * SCALE.average(), 1.5899 * SCALE.average());

    // Initialize dolly group for camera movement
    var dolly = new THREE.Group();
    dolly.add(this.player.light);
    
    // Set Euler rotation order for dolly
    dolly.rotation.order = "ZYX";
    dolly.add(camera);

    // Player update function
    this.player.update = function() {
        this.dolly.position.copy(this.position);
        // TODO: Check for issues in actual VR
        this.dolly.rotation.y = this.theta;
        this.dolly.rotation.x = this.phi;
    };

    this.player.dolly = dolly;
    this.player.update();
    scene.add(dolly);

    this.dolly = dolly;

    // Generate maze based on provided dimensions
    var maze = generateMaze(args.width, args.height);
    var mazeWalls = [];
    var torchBuilder = new TorchBuilder();

    // Generate walls of the maze
    var walls = [];
    for (var x = 0; x < maze.width * 2 + 1; x++) {
        walls[x] = [];
        if (x % 2 === 0) {
            for (var y = 0; y < maze.height * 2 + 1; y++) {
                walls[x].push((y % 2 === 0 || !(x > 0 && maze.vertical[x / 2 - 1][Math.floor(y / 2)])));
            }
        } else {
            for (var y = 0; y < maze.height * 2 + 1; y++) {
                walls[x].push((y % 2 === 0 && !(y > 0 && maze.horizontal[(x - 1) / 2][y / 2 - 1])));
            }
        }
    }

    // Define start and finish points of the maze
    walls[0][1] = false; // start
    walls[maze.width * 2 - 1][maze.height * 2] = false; // finish

    // Actual dimensions of the maze
    var actualMazeWidth = walls.length;
    var actualMazeHeight = walls[0].length;

    console.log(walls);

    // Wall arrays for X and Z axes
    var xw = []; // walls along x axis, first dimension is x, second z
    var zw = []; // walls along z axis, first dimension is z, second x

    // Additional + 1 is for easy culling
    for (var x = 0; x < actualMazeWidth + 1; x++) {
        xw.push([]);
        for (var z = 0; z < actualMazeHeight + 1 + 1; z++) {
            xw[x].push(false);
        }
    }
    for (var z = 0; z < actualMazeHeight + 1; z++) {
        zw.push([]);
        for (var x = 0; x < actualMazeWidth + 1 + 1; x++) {
            zw[z].push(false);
        }
    }

    // Populate wall arrays based on maze structure
    for (var x = 0; x < actualMazeWidth; x++) {
        for (var z = 0; z < actualMazeHeight; z++) {
            if (walls[z][x]) {
                if (z <= 0 || !walls[z - 1][x]) {
                    // front
                    xw[x][z] = { flipped: 1 };
                }
                if (z >= actualMazeHeight - 1 || !walls[z + 1][x]) {
                    // back
                    xw[x][z + 1] = { flipped: 0 };
                }
                if (x <= 0 || !walls[z][x - 1]) {
                    // left
                    zw[z][x] = { flipped: 1 };
                }
                if (x >= actualMazeWidth - 1 || !walls[z][x + 1]) {
                    // right
                    zw[z][x + 1] = { flipped: 0 };
                }
            }
        }
    }

    console.log(xw);
    console.log(zw);

    var matrix = new THREE.Matrix4();
    var tmpgeom = new THREE.Geometry();

    // Define single wall geometries for X and Z axes
    var SingleWallGeom = new THREE.PlaneBufferGeometry(1, 1);
    var SingleWallGeoms = {
        x: [
            new THREE.Geometry().fromBufferGeometry(SingleWallGeom.clone().rotateY(Math.TAU / 4)),
            new THREE.Geometry().fromBufferGeometry(SingleWallGeom.clone().rotateY(Math.TAU * 3 / 4))
        ],
        z: [
            new THREE.Geometry().fromBufferGeometry(SingleWallGeom),
            new THREE.Geometry().fromBufferGeometry(SingleWallGeom.clone().rotateY(Math.PI))
        ]
    };

    // Generate and merge wall geometries along x axis
    for (var z = 0; z < xw[0].length; z++) {
        for (var x = 0; x < xw.length; x++) {
            var wall = xw[x][z];
            if (wall) {
                matrix.makeTranslation(z - 1 / 2, 0, x);
                tmpgeom.merge(SingleWallGeoms.x[wall.flipped], matrix);
            }
        }
    }

    // Generate and merge wall geometries along z axis
    for (var x = 0; x < zw[0].length; x++) {
        for (var z = 0; z < zw.length; z++) {
            var wall = zw[z][x];
            if (wall) {
                matrix.makeTranslation(z, 0, x - 1 / 2);
                tmpgeom.merge(SingleWallGeoms.z[wall.flipped], matrix);
            }
        }
    }

    // Scale the geometry to match the maze scale
    tmpgeom.scale(SCALE.x, SCALE.y, SCALE.z);
    var mazeGeom = new THREE.BufferGeometry().fromGeometry(tmpgeom);
    mazeGeom.computeBoundingSphere();

    // Define material for the maze walls
    var CubeBumpMap = Asset.texture("bump.png");
    CubeBumpMap.wrapT = CubeBumpMap.wrapS = THREE.RepeatWrapping;
    CubeBumpMap.offset.set(0, 0);
    CubeBumpMap.repeat.set(1, 1);

    var CubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        bumpMap: CubeBumpMap,
        bumpScale: 0.55,
        shininess: 12,
        side: THREE.DoubleSide
    });
    CubeMaterial.displacementMap = CubeBumpMap;
    CubeMaterial.displacementScale = 23;

    // Create the maze mesh and add it to the scene
    var mazeMesh = new THREE.Mesh(mazeGeom, CubeMaterial);
    scene.add(mazeMesh);

    // Add random torches in the maze
    for (var x = 0; x < walls.length; x++) {
        for (var y = 0; y < walls[x].length; y++) {
            if (!walls[x][y] && rnd(20) === 0) {
                var options = [];
                if (x > 0 && walls[x - 1][y]) options.push(Direction.West);
                if (x < walls.length - 1 && walls[x + 1][y]) options.push(Direction.East);
                if (y > 0 && walls[x][y - 1]) options.push(Direction.South);
                if (y < walls[x].length - 1 && walls[x][y + 1]) options.push(Direction.North);
                torchBuilder.addTorch(new THREE.Vector3(x, 0, y), DirectionToAngle(options.randomElement()));
            }
        }
    }

    // Place a torch at the entrance of the maze
    torchBuilder.addTorch(new THREE.Vector3(-1, 0, 0), DirectionToAngle(Direction.East));
    torchBuilder.finish();

    // Store the maze mesh in mazeWalls array
    mazeWalls.push(mazeMesh);
    this.walls = mazeWalls;

    // Define the ceiling geometry and material
    var MazePlane = new THREE.PlaneGeometry(actualMazeWidth * SCALE.x, actualMazeHeight * SCALE.z);
    var CeilingBumpMap = Asset.texture("ceiling_bump.png");
    CeilingBumpMap.wrapT = CeilingBumpMap.wrapS = THREE.RepeatWrapping;
    CeilingBumpMap.repeat.set(actualMazeWidth * SCALE.x, actualMazeHeight * SCALE.z);

    var CeilingMaterial = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        bumpMap: CeilingBumpMap,
        bumpScale: 0.4,
        shininess: 11
    });

    // Create and position the ceiling
    var Ceiling = new THREE.Mesh(MazePlane, CeilingMaterial);
    Ceiling.position.set(maze.width, 1 / 2, maze.height).multiply(SCALE);
    Ceiling.rotation.x = Math.TAU / 4;
    scene.add(Ceiling);

    // Define the floor geometry and material
    var FloorBumpMap = Asset.texture("floor_bump.png");
    FloorBumpMap.wrapT = FloorBumpMap.wrapS = THREE.RepeatWrapping;
    FloorBumpMap.repeat.set(actualMazeWidth, actualMazeHeight);

    var FloorMaterial = new THREE.MeshPhongMaterial({
        color: 0xb0b0b0,
        bumpMap: FloorBumpMap,
        bumpScale: 0.64,
        shininess: 10
    });

    // Create and position the floor
    var Floor = new THREE.Mesh(MazePlane, FloorMaterial);
    Floor.position.set(maze.width, -1 / 2, maze.height).multiply(SCALE);
    Floor.rotation.x = Math.TAU * 3 / 4;
    scene.add(Floor);

    // Create and position the outside floor
    var OutsideFloorSize = Math.max(50, actualMazeWidth, actualMazeHeight) * 2 * avgScaleXZ;
    var OutsideFloorTexture = Asset.texture("floor.gif");
    OutsideFloorTexture.wrapT = OutsideFloorTexture.wrapS = THREE.RepeatWrapping;
    OutsideFloorTexture.repeat.set(Math.floor(OutsideFloorSize * 2 / SCALE.x), Math.floor(OutsideFloorSize * 2 / SCALE.z));

    var OutsideFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(OutsideFloorSize, OutsideFloorSize),
        new THREE.MeshBasicMaterial({
            map: OutsideFloorTexture,
            color: 0x888888
        })
    );

    OutsideFloor.position.set(-1 / 2, -1 / 2 - 0.01, -1 / 2).multiply(SCALE);
    OutsideFloor.rotation.x = Math.TAU * 3 / 4; // Rotate floor to make it a floor and not a wall
    scene.add(OutsideFloor);

    // Initialize XR controls
    this.xrControls = new XRControls(this, [mazeMesh, Floor, OutsideFloor]);

    // Set movement speed
    this.MOVESPEED = 1.5 * avgScaleXZ;
};

// Post XR initialization
Game.prototype.postXRInit = function() {
    // Add fullscreen key binding
    THREEx.FullScreen.bindKey({ charCode: 'f'.charCodeAt(0) });

    // Initialize pointer lock
    if (requestPointerLock()) {
        new PointerLock();
    }

    // Initialize XR controls if WebXR is present
    if (WEBXR_PRESENT) {
        this.xrControls.init();
    }
};

// Handle XR session changes
Game.prototype.onXRSessionChange = function(sessionType) {
    console.info(sessionType);

    // Adjust player position based on XR session state
    if (sessionType === "sessionStarted") {
        g.player.position.y = (-1 / 2 + 0.08) * SCALE.y;
    } else if (sessionType === "sessionEnded") {
        g.player.position.y = 0;
    }
};

// Check if player collides with walls
Game.prototype.playerCollides = function(dir, amount) {
    var ray = new THREE.Raycaster(this.player.position, dir, 0, amount + 0.14);
    var colliders = ray.intersectObjects(this.walls, false);
    return (colliders.length > 0 && colliders[0].distance - 0.5 < amount);
};

// Update game state
Game.prototype.update = function(delta) {
    var MoveSpeed = this.MOVESPEED * delta;
    var KeyRotateSpeed = 1.4 * delta;

    // Toggle hacks mode
    if (InputManager.isKeyPressed(113 /*f2*/)) {
        this.hacks ^= true;
    }

    // Apply hacks for movement and rotation
    if (this.hacks) {
        if (InputManager.isKeyDown(16 /*shift*/)) {
            MoveSpeed *= 4; // Go faster
        }
        if (InputManager.isKeyDown(32 /*space*/)) {
            this.player.position.y += MoveSpeed; // Go up
        } else if (InputManager.isKeyDown(17 /*ctrl*/)) {
            this.player.position.y -= MoveSpeed; // Go down
        }
    }

    // Handle player rotation
    if (InputManager.isKeyDown(81 /*q*/)) {
        this.player.theta += KeyRotateSpeed; // Turn left
    } else if (InputManager.isKeyDown(69 /*e*/)) {
        this.player.theta -= KeyRotateSpeed; // Turn right
    }
    this.player.theta = rotclamp(this.player.theta);

    var cTheta = Math.cos(this.player.theta);
    var sTheta = Math.sin(this.player.theta);

    var dir = new THREE.Vector3(-1.0 * sTheta, 0, -1.0 * cTheta);

    // Handle player movement forward and backward
    if ((InputManager.isKeyDown(87 /* w */) || InputManager.isKeyDown(38 /* arrow key up */)) && !this.playerCollides(dir, MoveSpeed)) {
        this.player.position.x += dir.x * MoveSpeed;
        this.player.position.z += dir.z * MoveSpeed;
    } else if ((InputManager.isKeyDown(83 /* s */) || InputManager.isKeyDown(40 /* arrow key down */)) && !this.playerCollides(new THREE.Vector3(-dir.x, -dir.y, -dir.z), MoveSpeed)) {
        this.player.position.x -= dir.x * MoveSpeed;
        this.player.position.z -= dir.z * MoveSpeed;
    }

    var xProd = new THREE.Vector3();
    xProd.crossVectors(dir, new THREE.Vector3(0, 1.0, 0));

    // Handle player movement left and right
    if ((InputManager.isKeyDown(65 /* a */) || InputManager.isKeyDown(37 /* arrow key left */)) && !this.playerCollides(new THREE.Vector3(-xProd.x, -xProd.y, -xProd.z), MoveSpeed)) {
        this.player.position.x -= xProd.x * MoveSpeed;
        this.player.position.z -= xProd.z * MoveSpeed;
    } else if ((InputManager.isKeyDown(68 /*d*/ ) || InputManager.isKeyDown(39 /* arrow key right */)) && !this.playerCollides(xProd, MoveSpeed)) {
        this.player.position.x += xProd.x * MoveSpeed;
        this.player.position.z += xProd.z * MoveSpeed;
    }

    // Update player and XR controls
    this.player.update();
    this.xrControls.update(delta);

    // Update input manager state
    InputManager.update();
};

// Determine if the scene must be rendered
Game.prototype.mustRender = function() {
    return true; // Always render the scene
};
