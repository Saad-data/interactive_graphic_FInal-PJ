
# Maze Game

## Introduction

The Maze Game is an interactive 3D maze navigation game developed using WebXR and Three.js. This project provides an immersive experience where players navigate through a procedurally generated maze, enhanced by smooth controls and realistic lighting.

## Table of Contents

1. [How to Use the Code](#how-to-use-the-code)
2. [Project Structure](#project-structure)
3. [Functionality of Each JavaScript File](#functionality-of-each-javascript-file)
4. [Logic Used in the Code](#logic-used-in-the-code)
5. [Textures and Their Purpose](#textures-and-their-purpose)
6. [Conclusion](#conclusion)

## How to Use the Code

1. **Clone the Repository:**
   \`\`\`bash
   git clone https://github.com/Saad-data/interactive_graphic_FInal-PJ.git
   cd interactive_graphic_FInal-PJ
   \`\`\`

2. **Open `index.html` in a Browser:**
   Open the `index.html` file in a web browser that supports WebXR and pointer lock. For the best experience, use the latest version of Chrome or Firefox.

3. **Navigate the Maze:**
   - Use `W`, `A`, `S`, `D` or arrow keys to move forward, backward, and sideways.
   - Use `Q` and `E` to rotate left and right.
   - Press `F2` to enable or disable hacks mode for enhanced movement.

## Project Structure

### Directories and Files

#### `js/`
- **`assetmanager.js`**: Manages the loading and retrieval of textures.
- **`inputmanager.js`**: Handles keyboard input and tracks key states.
- **`main.js`**: Initializes the game, sets up the scene, and starts the rendering loop.
- **`mazegame.js`**: Contains the core game logic, including maze generation and player interaction.
- **`pointerlock.js`**: Implements pointer lock functionality for improved control.
- **`torch.js`**: Manages torch creation and placement within the maze.
- **`utils.js`**: Contains utility functions and constants used throughout the project.
- **`xrcontrols.js`**: Manages XR controller interactions and updates.

#### `lib/`
- **`mazegen.js`**: Algorithm for generating the maze structure.
- **`three.min.js`**: Three.js library for 3D rendering.
- **`THREEx.FullScreen.js`**: Adds fullscreen support.
- **`tools.js`**: Additional helper functions.
- **`VRButton.js`**: Adds a VR button for entering XR mode.

#### `res/`
- **`bump.png`**: Bump map texture for the maze walls.
- **`ceiling_bump.png`**: Bump map texture for the ceiling.
- **`floor_bump.png`**: Bump map texture for the floor.
- **`floor.gif`**: Texture for the outside floor.

#### Other Files
- **`index.html`**: The main HTML file that sets up the game environment.
- **`LICENSE.md`**: The license for the project.
- **`README.md`**: This readme file.

## Functionality of Each JavaScript File

### `assetmanager.js`
Manages textures used in the game by loading them from the `res` directory and caching them to optimize performance.

### `inputmanager.js`
Tracks the state of keyboard inputs, allowing the game to respond to player actions by distinguishing between keys that are currently pressed and those that were just pressed.

### `main.js`
Sets up the scene, camera, and renderer. Initializes the game, starts the animation loop, and handles window resizing to ensure the game renders correctly at any screen size.

### `mazegame.js`
Contains the main game logic, including maze generation using a procedural algorithm, player initialization, and the game loop. It also handles interactions with walls and torches.

### `pointerlock.js`
Enables pointer lock to provide a seamless first-person control experience by capturing mouse movement to adjust the player's view direction.

### `torch.js`
Manages the creation and placement of torches within the maze. Torches provide lighting and are placed at random positions to aid navigation.

### `utils.js`
Contains utility functions such as mathematical constants, vector operations, and rotation functions. Includes the `Direction` enum and conversion functions.

### `xrcontrols.js`
Handles XR controller interactions, allowing players to use VR controllers to navigate the maze. Updates the controller states and manages interactions with objects in the maze.

## Logic Used in the Code

### Maze Generation
The maze is generated using a procedural algorithm in `mazegen.js`, ensuring a unique maze layout every time the game starts.

### Player Interaction
The player's position and view direction are updated based on keyboard and mouse input. The game checks for collisions with walls to prevent the player from moving through them.

### Torches
Torches are placed at random positions in the maze to provide lighting. Each torch consists of a mesh and a light source.

### Rendering Loop
The rendering loop in `main.js` updates the game state and renders the scene at a consistent frame rate. It leverages Three.js to render the 3D maze and handle camera movements.

### Pointer Lock
Pointer lock is implemented to capture mouse movement and provide a first-person control experience. This is managed in `pointerlock.js`.

### XR Controls
The game supports VR controllers, allowing players to navigate the maze in a VR environment. This is managed in `xrcontrols.js`.

## Textures and Their Purpose

### `bump.png`
Used as a bump map for the maze walls to add depth and texture.

### `ceiling_bump.png`
Used as a bump map for the ceiling to add visual detail.

### `floor_bump.png`
Used as a bump map for the floor inside the maze to enhance its appearance.

### `floor.gif`
Used as the texture for the outside floor surrounding the maze.

### `Demo`
You can try the live demo of the Maze Game by clicking the link below:
[Live Demo](http://127.0.0.1:5500/index.html)

## Conclusion

This project demonstrates an immersive 3D maze game using WebXR and Three.js. By following the setup instructions and understanding the structure and functionality of the code, you can explore and modify the game to create your own unique experiences. If you have any questions or need further assistance, feel free to reach out through the GitHub repository.

---

&copy; 2024 Saad-data. All rights reserved.
