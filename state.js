/**
 * State management module for the hexagonal grid
 * This module combines the separate state modules to provide a unified interface
 */
import { config, calculateHexX, calculateHexY } from './config.js';
import { viewState, resetViewState, setZoom, panView } from './viewState.js';
import { mapState, initializeCellStates, toggleCellState, cellExists } from './mapState.js';

// Create and export the unified application state
export const appState = {
    // Grid configuration
    get gridConfig() { return config.gridConfig; },
    
    // Cell states
    get cells() { return mapState.cells; },
    get activeHexagon() { return mapState.activeHexagon; },
    set activeHexagon(value) { mapState.activeHexagon = value; },
    
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
    resetViewState,
    setZoom,
    panView
};
