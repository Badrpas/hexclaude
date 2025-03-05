/**
 * Create a single hexagon cell
 * @param {number} rowIndex - The row index
 * @param {number} cellIndex - The cell index
 * @param {number} isVisible - Whether the cell is visible (1) or not (0)
 * @returns {jQuery} The hexagon jQuery element
 */
export function createHexCell(rowIndex, cellIndex, isVisible) {
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