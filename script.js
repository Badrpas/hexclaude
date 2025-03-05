import { createHexCell } from './hexCell.js';

$(document).ready(function() {
    // Grid configuration
    var gridConfig = [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1],
        [1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 1, 1]
    ];

    // Render the grid
    function renderGrid() {
        var $grid = $('#hexagonal-grid');

        for (var rowIndex = 0; rowIndex < gridConfig.length; rowIndex++) {
            var row = gridConfig[rowIndex];
            var $rowElement = $('<div>')
                .addClass('hex-row')
                .addClass(rowIndex % 2 === 0 ? 'even' : 'odd');

            for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                var isCell = row[cellIndex];
                var $hexCell = createHexCell(rowIndex, cellIndex, isCell);
                $rowElement.append($hexCell);
            }

            $grid.append($rowElement);
        }
    }

    // Initialize the grid
    renderGrid();
});