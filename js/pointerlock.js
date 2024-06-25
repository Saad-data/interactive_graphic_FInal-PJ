/*
 * Add pointerlock functionality for better game control.
 * Args: object
 *      sensitivity: Custom sensitivity of the mouse.
 */
var PointerLock = function(args) {
    var scope = this;
    if (!args) args = {};
    this.sensitivity = args.sensitivity || 0.002; // Set custom sensitivity or default value

    pointerLockActive = false; // Flag to check if pointer lock is active

    // Event handler for mouse movement
    var onMouseMove = function(event) {
        if (pointerLockActive === false) return; // Ignore events if pointer lock is not active

        var movementX = event.movementX || event.mozMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || 0;

        // Update player orientation based on mouse movement and sensitivity
        g.player.theta -= movementX * scope.sensitivity;
        g.player.phi -= movementY * scope.sensitivity;

        // Constrain the vertical rotation angle to avoid flipping
        g.player.phi = Math.constrainRadius(g.player.phi, Math.TAU / 4);
    };

    // Add mouse move event listener to the document
    document.addEventListener("mousemove", onMouseMove, false);
};

// Check if the browser supports pointer lock
var hasBrowserPointerlock = function() {
    return 'pointerLockElement' in document
        || 'mozPointerLockElement' in document
        || 'webkitPointerLockElement' in document;
};

// Request pointer lock
var requestPointerLock = function() {
    var element = document.body;

    if (hasBrowserPointerlock()) {
        // Event handler for pointer lock change
        var pointerlockchange = function(event) {
            if (document.pointerLockElement === element ||
                document.mozPointerLockElement === element ||
                document.webkitPointerLockElement === element) {
                pointerLockActive = true; // Pointer lock is active
            } else {
                pointerLockActive = false; // Pointer lock is inactive
            }
        };

        // Event handler for pointer lock errors
        var pointerlockerror = function(event) {
            console.warn("Mysterious pointer lock error! :(");
            console.log(event);
            pointerLockActive = false;
        };

        // Add event listeners for pointer lock change and error events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        // Request pointer lock on click
        var requestPointerLock = function(event) {
            element.requestPointerLock = element.requestPointerLock
                || element.mozRequestPointerLock
                || element.webkitRequestPointerLock;

            element.requestPointerLock();
        };

        // Add click event listener to request pointer lock
        element.addEventListener('click', requestPointerLock, false);
        return true;
    } else {
        console.log("Upgrade your browser! Please! I can't use pointer lock!");
        return false;
    }
};
