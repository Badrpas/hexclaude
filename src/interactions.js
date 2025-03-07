/**
 * Interactions module for handling user input
 */
import { appState } from './state.js';
import { screenToWorld } from './renderer.js';
import { isPointInHexagon } from './hexagon.js';

/**
 * Set up all interaction handlers
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function to call on updates
 */
export function setupInteractions(canvas, renderFn) {
    // Click handler
    canvas.addEventListener('click', (event) => handleClick(event, canvas, renderFn));
    
    // Mouse handlers for panning
    canvas.addEventListener('mousedown', (event) => handleMouseDown(event, canvas));
    window.addEventListener('mousemove', (event) => handleMouseMove(event, renderFn));
    window.addEventListener('mouseup', handleMouseUp);
    
    // Wheel handler for zooming
    canvas.addEventListener('wheel', (event) => handleWheel(event, canvas, renderFn));
    
    // Touch handlers for mobile
    canvas.addEventListener('touchstart', (event) => handleTouchStart(event, canvas));
    canvas.addEventListener('touchmove', (event) => handleTouchMove(event, renderFn));
    canvas.addEventListener('touchend', handleTouchEnd);
}

/**
 * Handle click/tap events
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function
 */
function handleClick(event, canvas, renderFn) {
    if (appState.view.isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldPos = screenToWorld(canvas, screenX, screenY);
    
    // Check each cell to see if it was clicked
    for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
        const row = appState.cells[rowIndex];
        
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = appState.cells[rowIndex][cellIndex];
            
            if (!cell.isVisible) continue;
            
            // Check if click is within hexagon using world coordinates
            if (isPointInHexagon(worldPos.x, worldPos.y, cell.x, cell.y, appState.hexSize)) {
                // Toggle active state
                cell.isActive = !cell.isActive;
                console.log('Cell clicked:', cell);
                
                // Re-render
                renderFn();
                return;
            }
        }
    }
}

/**
 * Handle mouse down for panning
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function handleMouseDown(event, canvas) {
    event.preventDefault();
    
    appState.view.isDragging = true;
    appState.view.lastX = event.clientX;
    appState.view.lastY = event.clientY;
    
    canvas.style.cursor = 'grabbing';
}

/**
 * Handle mouse move for panning
 * @param {MouseEvent} event - Mouse event
 * @param {Function} renderFn - Render function
 */
function handleMouseMove(event, renderFn) {
    if (!appState.view.isDragging) return;
    
    const deltaX = event.clientX - appState.view.lastX;
    const deltaY = event.clientY - appState.view.lastY;
    
    appState.view.lastX = event.clientX;
    appState.view.lastY = event.clientY;
    
    appState.view.offsetX += deltaX / appState.view.scale;
    appState.view.offsetY += deltaY / appState.view.scale;
    
    renderFn();
}

/**
 * Handle mouse up to end panning
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseUp(event) {
    appState.view.isDragging = false;
    document.body.style.cursor = 'default';
}

/**
 * Handle scroll wheel for zooming
 * @param {WheelEvent} event - Wheel event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function
 */
function handleWheel(event, canvas, renderFn) {
    event.preventDefault();
    
    const zoomIntensity = 0.1;
    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);
    
    // Calculate new scale with limits
    const newScale = appState.view.scale * zoom;
    if (newScale < appState.view.minScale || newScale > appState.view.maxScale) {
        return;
    }
    
    appState.view.scale = newScale;
    
    renderFn();
}

/**
 * Handle touch start for panning on mobile
 * @param {TouchEvent} event - Touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function handleTouchStart(event, canvas) {
    if (event.touches.length === 1) {
        event.preventDefault();
        
        appState.view.isDragging = true;
        appState.view.lastX = event.touches[0].clientX;
        appState.view.lastY = event.touches[0].clientY;
    }
}

/**
 * Handle touch move for panning on mobile
 * @param {TouchEvent} event - Touch event
 * @param {Function} renderFn - Render function
 */
function handleTouchMove(event, renderFn) {
    if (!appState.view.isDragging || event.touches.length !== 1) return;
    
    event.preventDefault();
    
    const deltaX = event.touches[0].clientX - appState.view.lastX;
    const deltaY = event.touches[0].clientY - appState.view.lastY;
    
    appState.view.lastX = event.touches[0].clientX;
    appState.view.lastY = event.touches[0].clientY;
    
    appState.view.offsetX += deltaX / appState.view.scale;
    appState.view.offsetY += deltaY / appState.view.scale;
    
    renderFn();
}

/**
 * Handle touch end to stop panning
 * @param {TouchEvent} event - Touch event
 */
function handleTouchEnd(event) {
    appState.view.isDragging = false;
}