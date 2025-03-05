/**
 * Create a single hexagon cell
 * @param {Object} cellState - The state object for this cell
 * @param {number} cellState.rowIndex - The row index
 * @param {number} cellState.cellIndex - The cell index
 * @param {boolean} cellState.isVisible - Whether the cell is visible
 * @param {boolean} cellState.isActive - Whether the cell is active
 * @returns {jQuery} The hexagon jQuery element
 */
export function createHexCell(cellState) {
    var $hexagon = $('<div>')
        .addClass('hexagon')
        .attr('data-key', cellState.rowIndex + '-' + cellState.cellIndex);
    
    if (!cellState.isVisible) {
        $hexagon.css('opacity', '0');
        $hexagon.css('pointer-events', 'none');
    }
    
    if (cellState.isActive) {
        $hexagon.addClass('active');
    }

    var $hexagonInner = $('<div>').addClass('hexagon-inner');
    $hexagon.append($hexagonInner);

    // Store a reference to the state object in the DOM element
    $hexagon.data('state', cellState);

    $hexagon.on('click', function() {
        // Toggle state
        cellState.isActive = !cellState.isActive;
        $(this).toggleClass('active');
        
        // Log the click for debugging
        console.log('Cell clicked:', cellState);
    });

    return $hexagon;
}