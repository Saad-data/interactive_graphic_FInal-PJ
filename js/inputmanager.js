var InputManager = {
    keys: [], // Current state of keys
    oldKeys: [], // Previous state of keys

    // Update oldKeys to the current state of keys
    update: function() {
        this.oldKeys = [...this.keys];
    },

    // Mark the key as pressed
    keyDown: function(code) {
        this.keys[code] = true;
    },

    // Mark the key as released
    keyUp: function(code) {
        this.keys[code] = false;
    },

    // Check if the key is currently pressed
    isKeyDown: function(code) {
        return this.keys[code] === true;
    },

    // Check if the key was just pressed
    isKeyPressed: function(code) {
        return this.keys[code] === true && this.oldKeys[code] !== true;
    },
};

// Event listeners for keydown and keyup events
document.onkeydown = function(event) {
    InputManager.keyDown(event.keyCode);
};

document.onkeyup = function(event) {
    InputManager.keyUp(event.keyCode);
};
