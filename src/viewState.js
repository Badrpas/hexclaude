/**
 * View state module for managing zoom and pan
 */

// Create the view state
export const viewState = {
    // Zoom and pan state
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    minScale: 0.5,
    maxScale: 3
};

/**
 * Reset view state to initial values
 */
export function resetViewState() {
    viewState.scale = 1;
    viewState.offsetX = 0;
    viewState.offsetY = 0;
    viewState.isDragging = false;
    viewState.lastX = 0;
    viewState.lastY = 0;
}

/**
 * Set zoom level with bounds checking
 * @param {number} newScale - New scale value
 * @returns {boolean} Whether the scale was changed
 */
export function setZoom(newScale) {
    if (newScale >= viewState.minScale && newScale <= viewState.maxScale) {
        viewState.scale = newScale;
        return true;
    }
    return false;
}

/**
 * Pan the view
 * @param {number} deltaX - Change in X position
 * @param {number} deltaY - Change in Y position
 */
export function panView(deltaX, deltaY) {
    viewState.offsetX += deltaX / viewState.scale;
    viewState.offsetY += deltaY / viewState.scale;
}