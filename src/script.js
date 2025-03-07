/**
 * Main entry point for the hexagonal grid application
 */
import { initializeCellStates, placeUnit } from './state.js';
import { render } from './renderer.js';
import { setupInteractions } from './interactions.js';
import { createUnit, UnitType, UnitOwner } from './unit.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match window and handle resize events
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderCanvas(); // Re-render when resized
    }
    
    // Create a render function that passes canvas and context
    function renderCanvas() {
        render(canvas, ctx);
    }
    
    // Set up all event listeners
    window.addEventListener('resize', resizeCanvas);
    setupInteractions(canvas, renderCanvas);
    
    // Initialize cell states
    initializeCellStates();
    
    // Create and place initial units
    initializeUnits();
    
    // Initial render
    resizeCanvas();
});

/**
 * Initialize units and place them on the grid
 */
function initializeUnits() {
    // Create player units
    const playerSoldier1 = createUnit(UnitType.SOLDIER, UnitOwner.PLAYER);
    const playerSoldier2 = createUnit(UnitType.SOLDIER, UnitOwner.PLAYER);
    const playerArcher = createUnit(UnitType.ARCHER, UnitOwner.PLAYER);
    const playerKnight = createUnit(UnitType.KNIGHT, UnitOwner.PLAYER);
    const playerMage = createUnit(UnitType.MAGE, UnitOwner.PLAYER);
    
    // Create AI units
    const aiSoldier1 = createUnit(UnitType.SOLDIER, UnitOwner.AI);
    const aiSoldier2 = createUnit(UnitType.SOLDIER, UnitOwner.AI);
    const aiArcher = createUnit(UnitType.ARCHER, UnitOwner.AI);
    const aiKnight = createUnit(UnitType.KNIGHT, UnitOwner.AI);
    const aiMage = createUnit(UnitType.MAGE, UnitOwner.AI);
    
    // Place player units on the bottom side of the grid
    placeUnit(playerSoldier1, 5, 0);
    placeUnit(playerSoldier2, 5, 1);
    placeUnit(playerArcher, 5, 2);
    placeUnit(playerKnight, 5, 5);
    placeUnit(playerMage, 5, 4);
    
    // Place AI units on the top side of the grid
    placeUnit(aiSoldier1, 0, 0);
    placeUnit(aiSoldier2, 0, 1);
    placeUnit(aiArcher, 0, 2);
    placeUnit(aiKnight, 0, 3);
    placeUnit(aiMage, 0, 4);
}
