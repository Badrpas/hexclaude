import { createHexCell } from './hexCell.js';

$(document).ready(function() {
    // Global state
    var appState = {
        // Grid configuration (1 = visible, 0 = invisible)
        gridConfig: [
            [1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1]
        ],
        // Will store all cell states
        cells: []
    };

    // Initialize cell states
    function initializeCellStates() {
        for (var rowIndex = 0; rowIndex < appState.gridConfig.length; rowIndex++) {
            var row = appState.gridConfig[rowIndex];
            appState.cells[rowIndex] = [];
            
            for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                var isVisible = row[cellIndex] === 1;
                
                // Create state object for each cell
                appState.cells[rowIndex][cellIndex] = {
                    rowIndex: rowIndex,
                    cellIndex: cellIndex,
                    isVisible: isVisible,
                    isActive: false
                };
            }
        }
    }

    // Render the grid
    function renderGrid() {
        var $grid = $('#hexagonal-grid');

        for (var rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
            var row = appState.cells[rowIndex];
            var $rowElement = $('<div>')
                .addClass('hex-row')
                .addClass(rowIndex % 2 === 0 ? 'even' : 'odd');

            for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                var cellState = appState.cells[rowIndex][cellIndex];
                var $hexCell = createHexCell(cellState);
                $rowElement.append($hexCell);
            }

            $grid.append($rowElement);
        }
    }

    // Initialize the grid
    initializeCellStates();
    renderGrid();
});