/**
 * State management module for the hexagonal grid
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

// Create and export the application state
export const appState = {
    // Grid configuration
    gridConfig: defaultGridConfig,
    
    // Will store all cell states
    cells: [],
    
    // Drawing parameters
    hexSize: 50, // Base size of hexagons
    hexSpacing: 2.0, // Spacing factor for horizontal distance between hexagons
    hexRowSpacing: 2.0, // Spacing factor for vertical distance between rows
    activeHexagon: null,
    colors: {
        background: '#202325',
        hexagon: '#2a2d2f',
        active: '#4CAF50'
    },
    
    // Zoom and pan state
    view: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        lastX: 0,
        lastY: 0,
        minScale: 0.5,
        maxScale: 3
    }
};

/**
 * Calculate x-coordinate for a hexagon
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {number} X position of the hexagon
 */
export function calculateHexX(row, col) {
    const size = appState.hexSize;
    const horizontalDistance = size * appState.hexSpacing; // Apply spacing factor
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
    const size = appState.hexSize;
    const verticalDistance = size * 0.866 * appState.hexRowSpacing; // Apply row spacing factor
    return row * verticalDistance + size;
}

/**
 * Initialize cell states based on grid configuration
 */
export function initializeCellStates() {
    for (let rowIndex = 0; rowIndex < appState.gridConfig.length; rowIndex++) {
        const row = appState.gridConfig[rowIndex];
        appState.cells[rowIndex] = [];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const isVisible = row[cellIndex] === 1;

            // Calculate position 
            const x = calculateHexX(rowIndex, cellIndex);
            const y = calculateHexY(rowIndex);

            // Create state object for each cell
            appState.cells[rowIndex][cellIndex] = {
                rowIndex,
                cellIndex,
                isVisible,
                isActive: false,
                x,
                y
            };
        }
    }
}
