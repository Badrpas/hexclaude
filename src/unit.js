/**
 * Unit module for handling game units
 */

// Define unit types
export const UnitType = {
    SOLDIER: 'soldier',
    ARCHER: 'archer',
    KNIGHT: 'knight',
    MAGE: 'mage'
};

// Define unit owners
export const UnitOwner = {
    PLAYER: 'player',
    AI: 'ai',
    NEUTRAL: 'neutral'
};

// Unit class with properties and methods
export class Unit {
    /**
     * Create a new unit
     * @param {string} type - The unit type from UnitType
     * @param {string} owner - The unit owner from UnitOwner
     * @param {number} health - The unit's health points
     * @param {number} attack - The unit's attack strength
     * @param {number} movement - The unit's movement range in hexes
     */
    constructor(type, owner, health, attack, movement) {
        this.type = type;
        this.owner = owner;
        this.health = health;
        this.maxHealth = health;
        this.attack = attack;
        this.movement = movement;
        this.movementRemaining = movement;
        this.hasAttacked = false;
        this.position = { row: -1, col: -1 }; // Not placed yet
    }

    /**
     * Reset the unit's turn (movement and attack)
     */
    resetTurn() {
        this.movementRemaining = this.movement;
        this.hasAttacked = false;
    }

    /**
     * Take damage and return if unit is still alive
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} Whether the unit is still alive
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health > 0;
    }

    /**
     * Heal the unit by the specified amount
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Move the unit to a new position
     * @param {number} row - New row position
     * @param {number} col - New column position
     * @param {number} cost - Movement cost
     * @returns {boolean} Whether the move was successful
     */
    move(row, col, cost) {
        if (cost <= this.movementRemaining) {
            this.position = { row, col };
            this.movementRemaining -= cost;
            return true;
        }
        return false;
    }

    /**
     * Check if the unit can attack
     * @returns {boolean} Whether the unit can attack
     */
    canAttack() {
        return !this.hasAttacked;
    }

    /**
     * Perform an attack
     * @returns {number} The attack strength
     */
    performAttack() {
        if (this.canAttack()) {
            this.hasAttacked = true;
            return this.attack;
        }
        return 0;
    }

    /**
     * Get CSS color based on owner
     * @returns {string} CSS color
     */
    getColor() {
        switch (this.owner) {
            case UnitOwner.PLAYER:
                return '#4CAF50'; // Green
            case UnitOwner.AI:
                return '#F44336'; // Red
            case UnitOwner.NEUTRAL:
                return '#9E9E9E'; // Gray
            default:
                return '#FFFFFF'; // White
        }
    }

    /**
     * Get unit display symbol
     * @returns {string} Symbol representing unit type
     */
    getSymbol() {
        switch (this.type) {
            case UnitType.SOLDIER:
                return '♙';
            case UnitType.ARCHER:
                return '♘';
            case UnitType.KNIGHT:
                return '♞';
            case UnitType.MAGE:
                return '♝';
            default:
                return '?';
        }
    }
}

/**
 * Create a predefined unit based on type
 * @param {string} type - The unit type from UnitType
 * @param {string} owner - The unit owner from UnitOwner
 * @returns {Unit} New unit
 */
export function createUnit(type, owner) {
    switch (type) {
        case UnitType.SOLDIER:
            return new Unit(type, owner, 10, 3, 2);
        case UnitType.ARCHER:
            return new Unit(type, owner, 7, 4, 2);
        case UnitType.KNIGHT:
            return new Unit(type, owner, 12, 5, 3);
        case UnitType.MAGE:
            return new Unit(type, owner, 6, 6, 1);
        default:
            return new Unit(type, owner, 5, 2, 2);
    }
}