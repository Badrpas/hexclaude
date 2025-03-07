// Canvas-based hexagonal grid with zooming and panning
document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render(); // Re-render when resized
    }

    // Handle resize events
    window.addEventListener('resize', resizeCanvas);

    // Global state
    const appState = {
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
        cells: [],
        // Drawing parameters
        hexSize: 50, // Base size of hexagons
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

    // Initialize cell states
    function initializeCellStates() {
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

    // Calculate x-coordinate for a hexagon
    function calculateHexX(row, col) {
        const size = appState.hexSize;
        const horizontalDistance = size * 1.5;
        // Offset every other row
        return (row % 2 === 0)
            ? col * horizontalDistance + size * 1.5
            : col * horizontalDistance + size * 2.25;
    }

    // Calculate y-coordinate for a hexagon
    function calculateHexY(row) {
        const size = appState.hexSize;
        const verticalDistance = size * 0.866 * 1.7; // Height of hexagon * spacing factor
        return row * verticalDistance + size;
    }

    // Draw a single hexagon
    function drawHexagon(x, y, size, fillColor) {
        const hexHeight = size * 0.866; // height = side * sin(60°)

        ctx.beginPath();
        // Start at top point and draw clockwise
        ctx.moveTo(x, y - size);                     // Top point
        ctx.lineTo(x + size * 0.866, y - size * 0.5); // Top right
        ctx.lineTo(x + size * 0.866, y + size * 0.5); // Bottom right
        ctx.lineTo(x, y + size);                     // Bottom point
        ctx.lineTo(x - size * 0.866, y + size * 0.5); // Bottom left
        ctx.lineTo(x - size * 0.866, y - size * 0.5); // Top left
        ctx.closePath();

        // Fill hexagon
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    // Render the entire grid
    function render() {
        // Clear canvas
        ctx.fillStyle = appState.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate base center position
        const centerOffsetX = (canvas.width - appState.gridConfig[0].length * appState.hexSize * 1.5) / 2 + appState.hexSize;
        const centerOffsetY = (canvas.height - appState.gridConfig.length * appState.hexSize * 0.866 * 1.7) / 2 + appState.hexSize;
        
        // Draw each hexagon with zoom and pan applied
        ctx.save();
        
        // Apply zoom and pan transforms
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(appState.view.scale, appState.view.scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.translate(appState.view.offsetX, appState.view.offsetY);
        ctx.translate(centerOffsetX, centerOffsetY);
        
        for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
            const row = appState.cells[rowIndex];
            
            for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                const cell = appState.cells[rowIndex][cellIndex];
                
                if (cell.isVisible) {
                    const color = cell.isActive ? appState.colors.active : appState.colors.hexagon;
                    drawHexagon(cell.x, cell.y, appState.hexSize, color);
                }
            }
        }
        
        ctx.restore();
    }

    // Convert screen coordinates to world coordinates
    function screenToWorld(screenX, screenY) {
        // Invert the transformations from the render function
        const centerOffsetX = (canvas.width - appState.gridConfig[0].length * appState.hexSize * 1.5) / 2 + appState.hexSize;
        const centerOffsetY = (canvas.height - appState.gridConfig.length * appState.hexSize * 0.866 * 1.7) / 2 + appState.hexSize;
        
        // Apply inverse transformations in reverse order
        const x = screenX;
        const y = screenY;
        
        // Invert the translations and scaling
        const scaledX = (x - canvas.width / 2) / appState.view.scale + canvas.width / 2;
        const scaledY = (y - canvas.height / 2) / appState.view.scale + canvas.height / 2;
        
        // Invert the pan
        const panX = scaledX - appState.view.offsetX;
        const panY = scaledY - appState.view.offsetY;
        
        // Invert the center offset
        const worldX = panX - centerOffsetX;
        const worldY = panY - centerOffsetY;
        
        return { x: worldX, y: worldY };
    }
    
    // Handle click/tap events
    function handleClick(event) {
        if (appState.view.isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const worldPos = screenToWorld(screenX, screenY);
        
        // Check each cell to see if it was clicked
        for (let rowIndex = 0; rowIndex < appState.cells.length; rowIndex++) {
            const row = appState.cells[rowIndex];
            
            for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                const cell = appState.cells[rowIndex][cellIndex];
                
                if (!cell.isVisible) continue;
                
                // Check if click is within hexagon using world coordinates
                if (isPointInHexagon(worldPos.x, worldPos.y, cell.x, cell.y, appState.hexSize)) {
                    // Toggle active state
                    cell.isActive = !cell.isActive;
                    console.log('Cell clicked:', cell);
                    
                    // Re-render
                    render();
                    return;
                }
            }
        }
    }
    
    // Handle mouse down for panning
    function handleMouseDown(event) {
        event.preventDefault();
        
        appState.view.isDragging = true;
        appState.view.lastX = event.clientX;
        appState.view.lastY = event.clientY;
        
        canvas.style.cursor = 'grabbing';
    }
    
    // Handle mouse move for panning
    function handleMouseMove(event) {
        if (!appState.view.isDragging) return;
        
        const deltaX = event.clientX - appState.view.lastX;
        const deltaY = event.clientY - appState.view.lastY;
        
        appState.view.lastX = event.clientX;
        appState.view.lastY = event.clientY;
        
        appState.view.offsetX += deltaX / appState.view.scale;
        appState.view.offsetY += deltaY / appState.view.scale;
        
        render();
    }
    
    // Handle mouse up to end panning
    function handleMouseUp(event) {
        appState.view.isDragging = false;
        canvas.style.cursor = 'default';
    }
    
    // Handle scroll wheel for zooming
    function handleWheel(event) {
        event.preventDefault();
        
        const zoomIntensity = 0.1;
        const wheel = event.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        // Calculate new scale with limits
        const newScale = appState.view.scale * zoom;
        if (newScale < appState.view.minScale || newScale > appState.view.maxScale) {
            return;
        }
        
        appState.view.scale = newScale;
        
        // Recenter around mouse position during zoom
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        render();
    }
    
    // Handle touch events for panning
    function handleTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            
            appState.view.isDragging = true;
            appState.view.lastX = event.touches[0].clientX;
            appState.view.lastY = event.touches[0].clientY;
        }
    }
    
    function handleTouchMove(event) {
        if (!appState.view.isDragging || event.touches.length !== 1) return;
        
        event.preventDefault();
        
        const deltaX = event.touches[0].clientX - appState.view.lastX;
        const deltaY = event.touches[0].clientY - appState.view.lastY;
        
        appState.view.lastX = event.touches[0].clientX;
        appState.view.lastY = event.touches[0].clientY;
        
        appState.view.offsetX += deltaX / appState.view.scale;
        appState.view.offsetY += deltaY / appState.view.scale;
        
        render();
    }
    
    function handleTouchEnd(event) {
        appState.view.isDragging = false;
    }

    // Check if a point is inside a hexagon
    function isPointInHexagon(px, py, hexX, hexY, size) {
        // Distance from center of hexagon to point
        const dx = Math.abs(px - hexX);
        const dy = Math.abs(py - hexY);

        // Size calculations
        const r = size; // Distance from center to corner
        const h = r * 0.866; // Height from center to middle of side

        // If we're outside the bounding box, return early
        if (dx > r || dy > h * 2) return false;

        // Check if we're inside the hexagon using hex geometry
        // This is a simplified approximation that works well for our purpose
        return (r - dx) / r * h * 2 >= dy;
    }

    // Add event listeners
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // Touch event listeners for mobile devices
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Initialize and render
    initializeCellStates();
    resizeCanvas();
});
