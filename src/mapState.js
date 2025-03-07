/**
 * Map state module for managing grid cells and units
 */
import { config, calculateHexX, calculateHexY } from './config.js';

// Will store all cell states
export const mapState = {
    cells: [],
    activeHexagon: null,
    units: [], // Array to store all units in the game
    selectedUnit: null, // Currently selected unit
    currentTurn: 'player' // Who's turn it is (player or ai)
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
                isHighlighted: false, // For showing movement/attack range
                unit: null, // Reference to unit on this cell
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

/**
 * Get cell at the given coordinates
 * @param {number} rowIndex - Row index
 * @param {number} cellIndex - Cell index
 * @returns {Object|null} Cell object or null if not found
 */
export function getCell(rowIndex, cellIndex) {
    if (cellExists(rowIndex, cellIndex)) {
        return mapState.cells[rowIndex][cellIndex];
    }
    return null;
}

/**
 * Add a unit to the game
 * @param {Unit} unit - Unit to add
 * @returns {boolean} Whether the unit was added
 */
export function addUnit(unit) {
    if (unit) {
        mapState.units.push(unit);
        return true;
    }
    return false;
}

/**
 * Remove a unit from the game
 * @param {Unit} unit - Unit to remove
 * @returns {boolean} Whether the unit was removed
 */
export function removeUnit(unit) {
    const index = mapState.units.indexOf(unit);
    if (index !== -1) {
        mapState.units.splice(index, 1);
        
        // If unit was on a cell, remove the reference
        if (unit.position.row >= 0 && unit.position.col >= 0) {
            const cell = getCell(unit.position.row, unit.position.col);
            if (cell) {
                cell.unit = null;
            }
        }
        
        // If the removed unit was selected, clear the selection
        if (mapState.selectedUnit === unit) {
            mapState.selectedUnit = null;
        }
        
        return true;
    }
    return false;
}

/**
 * Place a unit on a cell
 * @param {Unit} unit - Unit to place
 * @param {number} rowIndex - Row index
 * @param {number} cellIndex - Cell index
 * @returns {boolean} Whether the unit was placed
 */
export function placeUnit(unit, rowIndex, cellIndex) {
    const cell = getCell(rowIndex, cellIndex);
    if (cell && cell.isVisible && !cell.unit) {
        // If the unit is already on another cell, remove it
        if (unit.position.row >= 0 && unit.position.col >= 0) {
            const oldCell = getCell(unit.position.row, unit.position.col);
            if (oldCell) {
                oldCell.unit = null;
            }
        }
        
        // Add unit to array if it's not already there
        if (!mapState.units.includes(unit)) {
            mapState.units.push(unit);
        }
        
        // Update unit position and cell reference
        unit.position = { row: rowIndex, col: cellIndex };
        cell.unit = unit;
        
        return true;
    }
    return false;
}

/**
 * Select a unit
 * @param {Unit} unit - Unit to select
 */
export function selectUnit(unit) {
    mapState.selectedUnit = unit;
    
    // Clear all highlighted cells
    clearHighlightedCells();
    
    // If a unit is selected, highlight cells in its movement range
    if (unit) {
        highlightMovementRange(unit);
    }
}

/**
 * Highlight all cells in a unit's movement range
 * @param {Unit} unit - Unit to show movement range for
 */
function highlightMovementRange(unit) {
    if (!unit || unit.movementRemaining <= 0) return;
    
    const { row, col } = unit.position;
    const movementRange = unit.movementRemaining;
    
    // Simple implementation that highlights all cells within movement range
    // A more complex implementation might consider movement cost and obstacles
    for (let r = 0; r < mapState.cells.length; r++) {
        for (let c = 0; c < mapState.cells[r].length; c++) {
            const cell = mapState.cells[r][c];
            if (cell.isVisible && !cell.unit) {
                // Calculate Manhattan distance (simplified for hexagonal grid)
                const distance = Math.abs(r - row) + Math.abs(c - col);
                if (distance <= movementRange) {
                    cell.isHighlighted = true;
                }
            }
        }
    }
}

/**
 * Clear all highlighted cells
 */
export function clearHighlightedCells() {
    for (let r = 0; r < mapState.cells.length; r++) {
        for (let c = 0; c < mapState.cells[r].length; c++) {
            mapState.cells[r][c].isHighlighted = false;
        }
    }
}

/**
 * Move a unit to a new cell
 * @param {import('./unit.js').Unit} unit - Unit to move
 * @param {number} rowIndex - Target row index
 * @param {number} cellIndex - Target cell index
 * @returns {boolean} Whether the move was successful
 */
export function moveUnit(unit, rowIndex, cellIndex) {
    if (!unit) return false;
    
    const targetCell = getCell(rowIndex, cellIndex);
    if (!targetCell || !targetCell.isVisible || targetCell.unit) return false;
    
    // Simple movement cost calculation (1 per cell)
    const cost = 1;

    const oldCell = getCell(unit.position.row, unit.position.col);
    
    // Update unit position using the unit's move method
    if (unit.move(rowIndex, cellIndex, cost)) {
        // Update cell references
        if (oldCell) {
            oldCell.unit = null;
        }
        
        targetCell.unit = unit;
        clearHighlightedCells();
        
        // If unit still has movement, highlight new movement range
        if (unit.movementRemaining > 0) {
            highlightMovementRange(unit);
        }
        
        return true;
    }
    
    return false;
}

/**
 * End the current turn and switch to the other player
 */
export function endTurn() {
    // Clear selected unit and highlights
    mapState.selectedUnit = null;
    clearHighlightedCells();
    
    // Switch turn
    mapState.currentTurn = mapState.currentTurn === 'player' ? 'ai' : 'player';
    
    // Reset all units for the current player
    mapState.units.forEach(unit => {
        if (unit.owner === mapState.currentTurn) {
            unit.resetTurn();
        }
    });
    
    // If it's AI turn, trigger AI logic
    if (mapState.currentTurn === 'ai') {
        // We'll implement AI logic in a separate function/module
        setTimeout(runAITurn, 500); // Add slight delay for better UX
    }
}

/**
 * Run the AI turn
 * This is a placeholder - real AI logic would go here
 */
function runAITurn() {
    // Basic AI that just moves units randomly and ends turn
    // Would be expanded with actual strategy in a full implementation
    
    // For now, just end the turn
    endTurn();
}
