/**
 * Map state module for managing grid cells
 */
import { config, calculateHexX, calculateHexY } from './config.js';

// Will store all cell states
export const mapState = {
    cells: [],
    activeHexagon: null
};

/**
 * Initialize cell states based on grid configuration
 */
export function initializeCellStates() {
    mapState.cells = [];
    
    for (let rowIndex = 0; rowIndex < config.gridConfig.length; rowIndex++) {
        const row = config.gridConfig[rowIndex];
        mapState.cells[rowIndex] = [];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const isVisible = row[cellIndex] === 1;

            // Calculate position 
            const x = calculateHexX(rowIndex, cellIndex);
            const y = calculateHexY(rowIndex);

            // Create state object for each cell
            mapState.cells[rowIndex][cellIndex] = {
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

/**
 * Toggle activation state of a cell
 * @param {number} rowIndex - Row index
 * @param {number} cellIndex - Cell index
 * @returns {boolean} New activation state
 */
export function toggleCellState(rowIndex, cellIndex) {
    if (rowIndex >= 0 && rowIndex < mapState.cells.length) {
        const row = mapState.cells[rowIndex];
        if (cellIndex >= 0 && cellIndex < row.length) {
            const cell = row[cellIndex];
            if (cell.isVisible) {
                cell.isActive = !cell.isActive;
                return cell.isActive;
            }
        }
    }
    return false;
}

/**
 * Check if a cell exists at the given coordinates
 * @param {number} rowIndex - Row index
 * @param {number} cellIndex - Cell index
 * @returns {boolean} Whether a visible cell exists at the coordinates
 */
export function cellExists(rowIndex, cellIndex) {
    if (rowIndex >= 0 && rowIndex < mapState.cells.length) {
        const row = mapState.cells[rowIndex];
        if (cellIndex >= 0 && cellIndex < row.length) {
            return row[cellIndex].isVisible;
        }
    }
    return false;
}