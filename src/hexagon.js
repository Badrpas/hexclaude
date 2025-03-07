/**
 * Hexagon drawing and hit detection module
 */

/**
 * Draw a single hexagon
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} size - Size of the hexagon
 * @param {string} fillColor - Fill color
 */
export function drawHexagon(ctx, x, y, size, fillColor) {
    const hexHeight = size * 0.866; // height = side * sin(60°)

    ctx.beginPath();
    // Start at top point and draw clockwise
    ctx.moveTo(x, y - size);                     // Top point
    ctx.lineTo(x + size * 0.866, y - size * 0.5); // Top right
    ctx.lineTo(x + size * 0.866, y + size * 0.5); // Bottom right
    ctx.lineTo(x, y + size);                     // Bottom point
    ctx.lineTo(x - size * 0.866, y + size * 0.5); // Bottom left
    ctx.lineTo(x - size * 0.866, y - size * 0.5); // Top left
    ctx.closePath();

    // Fill hexagon
    ctx.fillStyle = fillColor;
    ctx.fill();
}

/**
 * Check if a point is inside a hexagon
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} hexX - Hexagon center X
 * @param {number} hexY - Hexagon center Y
 * @param {number} size - Hexagon size
 * @returns {boolean} True if point is inside the hexagon
 */
export function isPointInHexagon(px, py, hexX, hexY, size) {
    // Distance from center of hexagon to point
    const dx = Math.abs(px - hexX);
    const dy = Math.abs(py - hexY);

    // Size calculations
    const r = size; // Distance from center to corner
    const h = r * 0.866; // Height from center to middle of side

    // If we're outside the bounding box, return early
    if (dx > r || dy > h * 2) return false;

    // Check if we're inside the hexagon using hex geometry
    // This is a simplified approximation that works well for our purpose
    return (r - dx) / r * h * 2 >= dy;
}