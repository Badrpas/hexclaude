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

    // Create a single hexagon cell
    function createHexCell(rowIndex, cellIndex, isVisible) {
        var $hexagon = $('<div>')
            .addClass('hexagon')
            .attr('data-key', rowIndex + '-' + cellIndex);
        
        if (!isVisible) {
            $hexagon.css('opacity', '0');
            $hexagon.css('pointer-events', 'none');
        }

        var $hexagonInner = $('<div>').addClass('hexagon-inner');
        $hexagon.append($hexagonInner);

        $hexagon.on('click', function() {
            $(this).toggleClass('active');
        });

        return $hexagon;
    }

    // Initialize the grid
    renderGrid();
});