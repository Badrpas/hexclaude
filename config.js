/**
 * Configuration module for the hexagonal grid application
 */

// Default grid configuration (1 = visible, 0 = invisible)
const defaultGridConfig = [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1]
];

// Application configuration
export const config = {
    // Grid configuration
    gridConfig: defaultGridConfig,
    
    // Drawing parameters
    hexSize: 50, // Base size of hexagons
    hexSpacing: 2.0, // Spacing factor for horizontal distance between hexagons
    hexRowSpacing: 2.0, // Spacing factor for vertical distance between rows
    
    // Colors
    colors: {
        background: '#202325',
        hexagon: '#2a2d2f',
        active: '#4CAF50'
    }
};

/**
 * Calculate x-coordinate for a hexagon
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {number} X position of the hexagon
 */
export function calculateHexX(row, col) {
    const size = config.hexSize;
    const horizontalDistance = size * config.hexSpacing; // Apply spacing factor
    // Offset every other row
    return (row % 2 === 0)
        ? col * horizontalDistance + size * 1.5
        : col * horizontalDistance + size * 2.5;
}

/**
 * Calculate y-coordinate for a hexagon
 * @param {number} row - Row index
 * @returns {number} Y position of the hexagon
 */
export function calculateHexY(row) {
    const size = config.hexSize;
    const verticalDistance = size * 0.866 * config.hexRowSpacing; // Apply row spacing factor
    return row * verticalDistance + size;
}