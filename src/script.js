/**
 * Main entry point for the hexagonal grid application
 */
import { initializeCellStates } from './state.js';
import { render } from './renderer.js';
import { setupInteractions } from './interactions.js';

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
    
    // Initial render
    resizeCanvas();
});
