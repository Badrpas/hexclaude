/**
 * Renderer module for the hexagonal grid
 */
import { appState } from './state.js';
import { drawHexagon } from './hexagon.js';

/**
 * Render the entire grid
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function render(canvas, ctx) {
    // Clear canvas
    ctx.fillStyle = appState.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate base center position
    const centerOffsetX = (canvas.width - appState.gridConfig[0].length * appState.hexSize * 1.5) / 2 + appState.hexSize;
    const centerOffsetY = (canvas.height - appState.gridConfig.length * appState.hexSize * 0.866 * 1.7) / 2 + appState.hexSize;
    
    // Draw each hexagon with zoom and pan applied
    ctx.save();
    
    // Apply zoom and pan transforms
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(appState.view.scale, appState.view.scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.translate(appState.view.offsetX, appState.view.offsetY);
    ctx.translate(centerOffsetX, centerOffsetY);
    
    // First, draw all cells
    for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
        const row = appState.cells[rowIndex];
        
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = row[cellIndex];
            
            if (cell.isVisible) {
                // Determine cell color
                let color = appState.colors.hexagon;
                
                if (cell.isActive) {
                    color = appState.colors.active;
                } else if (cell.isHighlighted) {
                    color = '#5D9CEC'; // Blue for movement range
                }
                
                // Draw the hexagon
                drawHexagon(ctx, cell.x, cell.y, appState.hexSize, color);
                
                // If the cell contains a selected unit, draw a border
                if (cell.unit && cell.unit === appState.selectedUnit) {
                    drawHexagonBorder(ctx, cell.x, cell.y, appState.hexSize, '#FFEB3B', 3); // Yellow border
                }
            }
        }
    }
    
    // Then draw units on top of cells
    for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
        const row = appState.cells[rowIndex];
        
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = row[cellIndex];
            
            if (cell.isVisible && cell.unit) {
                drawUnit(ctx, cell.x, cell.y, appState.hexSize, cell.unit);
            }
        }
    }
    
    // Draw turn indicator
    drawTurnIndicator(ctx, canvas.width, canvas.height);
    
    ctx.restore();
}

/**
 * Draw a unit on a hexagon
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate of hexagon center
 * @param {number} y - Y coordinate of hexagon center
 * @param {number} size - Size of hexagon
 * @param {Unit} unit - Unit to draw
 */
function drawUnit(ctx, x, y, size, unit) {
    const radius = size * 0.5;
    
    // Draw unit circle
    ctx.fillStyle = unit.getColor();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw unit symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(size * 0.4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.getSymbol(), x, y);
    
    // Draw health indicator if unit has taken damage
    if (unit.health < unit.maxHealth) {
        const healthPercent = unit.health / unit.maxHealth;
        const healthBarWidth = size * 0.8;
        const healthBarHeight = size * 0.1;
        
        // Health bar background
        ctx.fillStyle = '#333333';
        ctx.fillRect(
            x - healthBarWidth/2, 
            y + radius + 5, 
            healthBarWidth, 
            healthBarHeight
        );
        
        // Health bar fill
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(
            x - healthBarWidth/2, 
            y + radius + 5, 
            healthBarWidth * healthPercent, 
            healthBarHeight
        );
    }
    
    // Draw "exhausted" indicator if unit has no movement left
    if (unit.movementRemaining <= 0 || unit.hasAttacked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw a hexagon border
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate of hexagon center
 * @param {number} y - Y coordinate of hexagon center
 * @param {number} size - Size of hexagon
 * @param {string} color - Border color
 * @param {number} lineWidth - Border width
 */
function drawHexagonBorder(ctx, x, y, size, color, lineWidth) {
    const angleOffset = Math.PI / 6;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + angleOffset;
        const xPos = x + size * Math.cos(angle);
        const yPos = y + size * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    
    ctx.closePath();
    ctx.stroke();
}

/**
 * Draw turn indicator
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
function drawTurnIndicator(ctx, canvasWidth, canvasHeight) {
    // Save current transform to restore later
    const transform = ctx.getTransform();
    
    // Reset transform to draw in screen space
    ctx.resetTransform();
    
    const text = `${appState.currentTurn.toUpperCase()}'S TURN`;
    const padding = 10;
    
    // Set up text properties
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Measure text for background
    const textWidth = ctx.measureText(text).width;
    
    // Draw background
    ctx.fillStyle = appState.currentTurn === 'player' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
    ctx.fillRect(
        canvasWidth / 2 - textWidth / 2 - padding,
        20 - padding,
        textWidth + padding * 2,
        24 + padding * 2
    );
    
    // Draw text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, canvasWidth / 2, 20 + 12);
    
    // Restore transform
    ctx.setTransform(transform);
}

/**
 * Convert screen coordinates to world coordinates
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @returns {Object} World coordinates {x, y}
 */
export function screenToWorld(canvas, screenX, screenY) {
    // Invert the transformations from the render function
    const centerOffsetX = (canvas.width - appState.gridConfig[0].length * appState.hexSize * 1.5) / 2 + appState.hexSize;
    const centerOffsetY = (canvas.height - appState.gridConfig.length * appState.hexSize * 0.866 * 1.7) / 2 + appState.hexSize;
    
    // Apply inverse transformations in reverse order
    const x = screenX;
    const y = screenY;
    
    // Invert the translations and scaling
    const scaledX = (x - canvas.width / 2) / appState.view.scale + canvas.width / 2;
    const scaledY = (y - canvas.height / 2) / appState.view.scale + canvas.height / 2;
    
    // Invert the pan
    const panX = scaledX - appState.view.offsetX;
    const panY = scaledY - appState.view.offsetY;
    
    // Invert the center offset
    const worldX = panX - centerOffsetX;
    const worldY = panY - centerOffsetY;
    
    return { x: worldX, y: worldY };
}