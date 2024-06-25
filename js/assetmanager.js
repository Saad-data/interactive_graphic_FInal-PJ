var Asset = {
    textures: {},
    textureLoader: new THREE.TextureLoader(),

    init: function() {
        // Initialize any required assets here
    },

    // Load and return the texture by name
    texture: function(name) {
        // Check if the texture is already loaded
        if (!this.textures[name]) {
            this.textures[name] = this.textureLoader.load(
                "res/" + name,
                function(texture) {
                    console.log(name + " loaded successfully.");
                },
                undefined,
                function(xhr) {
                    console.warn("Couldn't load " + name + "!");
                }
            );
        }
        return this.textures[name];
    }
};
