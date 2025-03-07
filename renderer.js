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
    
    for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
        const row = appState.cells[rowIndex];
        
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = appState.cells[rowIndex][cellIndex];
            
            if (cell.isVisible) {
                const color = cell.isActive ? appState.colors.active : appState.colors.hexagon;
                drawHexagon(ctx, cell.x, cell.y, appState.hexSize, color);
            }
        }
    }
    
    ctx.restore();
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