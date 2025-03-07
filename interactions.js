/**
 * Interactions module for handling user input
 */
import { 
    appState, 
    toggleCellState, 
    setZoom, 
    panView,
    selectUnit,
    moveUnit,
    getCell,
    clearHighlightedCells,
    endTurn
} from './state.js';
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
    window.addEventListener('mouseup', (event) => handleMouseUp(event, canvas));
    
    // Wheel handler for zooming
    canvas.addEventListener('wheel', (event) => handleWheel(event, canvas, renderFn));
    
    // Touch handlers for mobile
    canvas.addEventListener('touchstart', (event) => handleTouchStart(event, canvas));
    canvas.addEventListener('touchmove', (event) => handleTouchMove(event, canvas, renderFn));
    canvas.addEventListener('touchend', (event) => handleTouchEnd(event, canvas, renderFn));
    
    // Prevent context menu on long press (mobile)
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    
    // Create an End Turn button
    createEndTurnButton(canvas.parentElement, renderFn);
}

/**
 * Create a button to end the current turn
 * @param {HTMLElement} container - Container element for the button
 * @param {Function} renderFn - Render function to call on updates
 */
function createEndTurnButton(container, renderFn) {
    // Create button element
    const button = document.createElement('button');
    button.textContent = 'End Turn';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#45a049';
    });
    
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#4CAF50';
    });
    
    // Add click handler
    button.addEventListener('click', () => {
        endTurn();
        renderFn();
        
        // Update button color based on current turn
        if (appState.currentTurn === 'player') {
            button.style.backgroundColor = '#4CAF50';
        } else {
            button.style.backgroundColor = '#F44336';
        }
    });
    
    // Add to container
    container.appendChild(button);
}

/**
 * Track if the user has moved the mouse/finger after mousedown/touchstart
 */
let hasMoved = false;

/**
 * Store the initial position on mouse/touch start
 */
let startX = 0;
let startY = 0;

/**
 * For pinch-to-zoom on mobile
 */
let initialPinchDistance = 0;

/**
 * Threshold for considering a mouse movement a drag vs a click (in pixels)
 */
const DRAG_THRESHOLD = 5;

/**
 * Handle click/tap events
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function
 */
function handleClick(event, canvas, renderFn) {
    // Don't process click if we're still dragging or if there was significant movement
    if (appState.view.isDragging || hasMoved) return;
    
    // Don't process clicks during AI's turn
    if (appState.currentTurn === 'ai') return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Check if we've moved beyond the threshold
    const deltaX = Math.abs(screenX - startX);
    const deltaY = Math.abs(screenY - startY);
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
        return;
    }
    
    // Convert screen coordinates to world coordinates
    const worldPos = screenToWorld(canvas, screenX, screenY);
    
    // Find the clicked cell
    let clickedCell = null;
    let clickedRow = -1;
    let clickedCol = -1;
    
    for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
        const row = appState.cells[rowIndex];
        
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = row[cellIndex];
            
            if (!cell.isVisible) continue;
            
            // Check if click is within hexagon using world coordinates
            if (isPointInHexagon(worldPos.x, worldPos.y, cell.x, cell.y, appState.hexSize)) {
                clickedCell = cell;
                clickedRow = rowIndex;
                clickedCol = cellIndex;
                break;
            }
        }
        
        if (clickedCell) break;
    }
    
    // If no cell was clicked, return
    if (!clickedCell) return;
    
    console.log('Cell clicked:', clickedCell);
    
    // Handle unit selection and movement
    handleCellInteraction(clickedCell, clickedRow, clickedCol, renderFn);
}

/**
 * Handle interaction with a cell (selection, movement, etc.)
 * @param {Object} cell - The cell that was clicked
 * @param {number} rowIndex - Row index of the cell
 * @param {number} colIndex - Column index of the cell
 * @param {Function} renderFn - Render function
 */
function handleCellInteraction(cell, rowIndex, colIndex, renderFn) {
    // If a unit is already selected
    if (appState.selectedUnit) {
        const selectedUnit = appState.selectedUnit;
        
        // If clicked on the same unit, deselect it
        if (cell.unit === selectedUnit) {
            selectUnit(null);
            renderFn();
            return;
        }
        
        // If clicked on another unit owned by player, select it instead
        if (cell.unit && cell.unit.owner === 'player') {
            selectUnit(cell.unit);
            renderFn();
            return;
        }
        
        // If clicked on a highlighted (valid move) cell
        if (cell.isHighlighted) {
            // Move the unit
            moveUnit(selectedUnit, rowIndex, colIndex);
            renderFn();
            return;
        }
        
        // If clicked on an enemy unit and in attack range, attack it
        // (Attack logic would go here)
        
        // Otherwise, deselect the current unit
        selectUnit(null);
        renderFn();
    } 
    // If no unit is selected
    else {
        // If clicked on a player's unit, select it
        if (cell.unit && cell.unit.owner === appState.currentTurn) {
            selectUnit(cell.unit);
            renderFn();
            return;
        }
        
        // Otherwise just toggle the cell state (legacy behavior)
        toggleCellState(rowIndex, colIndex);
        renderFn();
    }
}

/**
 * Handle mouse down for panning
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function handleMouseDown(event, canvas) {
    event.preventDefault();
    
    // Reset movement tracking
    hasMoved = false;
    
    // Store the initial position
    const rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    
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
    
    // If the mouse has moved significantly, mark as dragged
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMoved = true;
    }
    
    appState.view.lastX = event.clientX;
    appState.view.lastY = event.clientY;
    
    // Use the panView helper function
    panView(deltaX, deltaY);
    
    renderFn();
}

/**
 * Handle mouse up to end panning
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseUp(event, canvas) {
    appState.view.isDragging = false;
    canvas.style.cursor = 'default';
    
    // After a short delay, reset the moved flag
    setTimeout(() => {
        hasMoved = false;
    }, 50);
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
    
    // Calculate new scale and use setZoom helper function
    const newScale = appState.view.scale * zoom;
    if (setZoom(newScale)) {
        renderFn();
    }
}

/**
 * Calculate distance between two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {number} Distance between touch points
 */
function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate midpoint between two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {Object} Midpoint coordinates {x, y}
 */
function getTouchMidpoint(touch1, touch2) {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}

/**
 * Handle touch start for panning/zooming on mobile
 * @param {TouchEvent} event - Touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function handleTouchStart(event, canvas) {
    event.preventDefault();
    
    // Reset movement tracking
    hasMoved = false;
    
    if (event.touches.length === 1) {
        // Single touch - prepare for panning or tapping
        const rect = canvas.getBoundingClientRect();
        startX = event.touches[0].clientX - rect.left;
        startY = event.touches[0].clientY - rect.top;
        
        appState.view.isDragging = true;
        appState.view.lastX = event.touches[0].clientX;
        appState.view.lastY = event.touches[0].clientY;
    } 
    else if (event.touches.length === 2) {
        // Two touches - prepare for pinch zooming
        initialPinchDistance = getTouchDistance(event.touches[0], event.touches[1]);
        
        // Store the midpoint position for centering the zoom
        const midpoint = getTouchMidpoint(event.touches[0], event.touches[1]);
        appState.view.lastX = midpoint.x;
        appState.view.lastY = midpoint.y;
    }
}

/**
 * Handle touch move for panning/zooming on mobile
 * @param {TouchEvent} event - Touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function
 */
function handleTouchMove(event, canvas, renderFn) {
    event.preventDefault();
    
    if (event.touches.length === 1 && appState.view.isDragging) {
        // Single touch - handle panning
        const deltaX = event.touches[0].clientX - appState.view.lastX;
        const deltaY = event.touches[0].clientY - appState.view.lastY;
        
        // If the touch has moved significantly, mark as dragged
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasMoved = true;
        }
        
        appState.view.lastX = event.touches[0].clientX;
        appState.view.lastY = event.touches[0].clientY;
        
        // Use the panView helper function
        panView(deltaX, deltaY);
        
        renderFn();
    } 
    else if (event.touches.length === 2) {
        // Two touches - handle pinch zooming
        const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        
        if (initialPinchDistance > 0) {
            // Calculate zoom factor
            const zoomFactor = currentDistance / initialPinchDistance;
            
            // Apply zoom around the midpoint
            const rect = canvas.getBoundingClientRect();
            const midpoint = getTouchMidpoint(event.touches[0], event.touches[1]);
            const midpointX = midpoint.x - rect.left;
            const midpointY = midpoint.y - rect.top;
            
            // Calculate new scale and use setZoom helper function
            const newScale = appState.view.scale * zoomFactor;
            if (setZoom(newScale)) {
                // Update the midpoint and distance for the next move event
                appState.view.lastX = midpoint.x;
                appState.view.lastY = midpoint.y;
                initialPinchDistance = currentDistance;
                
                renderFn();
            }
        }
    }
}

/**
 * Handle touch end for mobile interactions
 * @param {TouchEvent} event - Touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Function} renderFn - Render function
 */
function handleTouchEnd(event, canvas, renderFn) {
    // If we have no touches and didn't move significantly, treat as a tap
    if (event.touches.length === 0 && !hasMoved) {
        // Use the last known position to simulate a click
        const simulatedClick = {
            clientX: appState.view.lastX,
            clientY: appState.view.lastY
        };
        
        // Small delay to make sure it's a tap
        setTimeout(() => {
            handleClick(simulatedClick, canvas, renderFn);
        }, 10);
    }
    
    // Reset state
    appState.view.isDragging = false;
    initialPinchDistance = 0;
    canvas.style.cursor = 'default';
    
    // After a short delay, reset the moved flag
    setTimeout(() => {
        hasMoved = false;
    }, 50);
}
