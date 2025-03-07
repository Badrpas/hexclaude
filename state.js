/**
 * State management module for the hexagonal grid
 * This module combines the separate state modules to provide a unified interface
 */
import { config, calculateHexX, calculateHexY } from './config.js';
import { viewState, resetViewState, setZoom, panView } from './viewState.js';
import { 
    mapState, 
    initializeCellStates, 
    toggleCellState, 
    cellExists,
    getCell,
    placeUnit,
    addUnit,
    removeUnit,
    moveUnit,
    selectUnit,
    clearHighlightedCells,
    endTurn
} from './mapState.js';

// Create and export the unified application state
export const appState = {
    // Grid configuration
    get gridConfig() { return config.gridConfig; },
    
    // Cell states
    get cells() { return mapState.cells; },
    get activeHexagon() { return mapState.activeHexagon; },
    set activeHexagon(value) { mapState.activeHexagon = value; },
    
    // Unit states
    get units() { return mapState.units; },
    get selectedUnit() { return mapState.selectedUnit; },
    get currentTurn() { return mapState.currentTurn; },
    
    // Drawing parameters
    get hexSize() { return config.hexSize; },
    get hexSpacing() { return config.hexSpacing; },
    get hexRowSpacing() { return config.hexRowSpacing; },
    get colors() { return config.colors; },
    
    // Zoom and pan state
    view: viewState
};

// Re-export functions from their respective modules
export { 
    calculateHexX, 
    calculateHexY,
    initializeCellStates,
    toggleCellState,
    cellExists,
    getCell,
    placeUnit,
    addUnit,
    removeUnit,
    moveUnit,
    selectUnit,
    clearHighlightedCells,
    endTurn,
    resetViewState,
    setZoom,
    panView
};
