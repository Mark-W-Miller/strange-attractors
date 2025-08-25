import { D_, DB } from '../../../debug/DB.js';
import { bondingRule } from './bonding.js';

function gravityVectorSensitivity(aut, database) {
    const { position, velocity, physics } = aut;
    const { GravityVectorArray, gridConfig } = database;
    const { positionScaleFactor } = gridConfig;

    const gridX = Math.floor(position.x / positionScaleFactor);
    const gridY = Math.floor(position.y / positionScaleFactor);

    if (
        gridY >= 0 && gridY < GravityVectorArray.length &&
        gridX >= 0 && gridX < GravityVectorArray[0].length
    ) {
        const gravityVector = GravityVectorArray[gridY][gridX];
        velocity.x += gravityVector.x / physics.mass;
        velocity.y += gravityVector.y / physics.mass;
        shitHappensVelocity(velocity);
    }
}

// --- Bounce Handlers --

function roundBounce(position, velocity, x, y, cellSize, gridConfig) {
    const centerX = x * cellSize + cellSize / 2;
    const centerY = y * cellSize + cellSize / 2;
    const radius = cellSize / Math.sqrt(2);

    const prevX = position.x - velocity.x;
    const prevY = position.y - velocity.y;
    const prevDist = Math.sqrt((prevX - centerX) ** 2 + (prevY - centerY) ** 2);
    const currDist = Math.sqrt((position.x - centerX) ** 2 + (position.y - centerY) ** 2);


    // Segment-circle intersection (robust for all directions)
    const dx = position.x - prevX;
    const dy = position.y - prevY;
    const fx = prevX - centerX;
    const fy = prevY - centerY;

    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false; // No intersection

    discriminant = Math.sqrt(discriminant);
    let t = (-b - discriminant) / (2 * a);
    if (t < 0 || t > 1) t = (-b + discriminant) / (2 * a);
    if (t < 0 || t > 1) return false; // Intersection not within segment

    // Compute intersection point
    const ix = prevX + t * dx;
    const iy = prevY + t * dy;
    const normalX = (ix - centerX) / radius;
    const normalY = (iy - centerY) / radius;

    // Reflect velocity
    const dotProduct = velocity.x * normalX + velocity.y * normalY;
    velocity.x -= 2 * dotProduct * normalX;
    velocity.y -= 2 * dotProduct * normalY;
    shitHappensVelocity(velocity);

    // Move to the edge plus a nudge
    const EPSILON = 0.01;
    position.x = centerX + normalX * (radius + EPSILON);
    position.y = centerY + normalY * (radius + EPSILON);
    shitHappensPosition(position, gridConfig);

    return true;
}

function squareBounce(position, velocity, x, y, cellSize, gridConfig) {
    // Calculate previous position (start of movement)
    const prevX = position.x - velocity.x;
    const prevY = position.y - velocity.y;

    // If the AUT started inside the square, skip bounce and treat as neutral
    if (
        prevX >= x * cellSize && prevX <= (x + 1) * cellSize &&
        prevY >= y * cellSize && prevY <= (y + 1) * cellSize
    ) {
        return false;
    }

    // If the AUT is not currently inside, no bounce needed
    if (
        position.x < x * cellSize || position.x > (x + 1) * cellSize ||
        position.y < y * cellSize || position.y > (y + 1) * cellSize
    ) {
        return false;
    }

    // Find the closest boundary and normal
    const left = position.x - x * cellSize;
    const right = (x + 1) * cellSize - position.x;
    const top = position.y - y * cellSize;
    const bottom = (y + 1) * cellSize - position.y;
    const minDist = Math.min(left, right, top, bottom);

    let normalX = 0, normalY = 0;
    if (minDist === left) normalX = 1;
    else if (minDist === right) normalX = -1;
    else if (minDist === top) normalY = 1;
    else if (minDist === bottom) normalY = -1;

    // Reflect velocity
    const dotProduct = velocity.x * normalX + velocity.y * normalY;
    velocity.x -= 2 * dotProduct * normalX;
    velocity.y -= 2 * dotProduct * normalY;
    shitHappensVelocity(velocity);

    // Move to the edge plus a nudge
    position.x += normalX * (Math.abs(minDist) + 0.01);
    position.y += normalY * (Math.abs(minDist) + 0.01);
    shitHappensPosition(position, gridConfig);
    return true;
}

// --- Main Terrain Sensitivity Rule ---

function terrainSensitivity(aut, database) {
    const { position, velocity } = aut;
    const { TerrainMap, terrainTypes, gridConfig } = database;
    const { positionScaleFactor, terrainScaleFactor } = gridConfig;

    const cellSize = positionScaleFactor * terrainScaleFactor;
    let x = Math.floor(position.x / cellSize);
    let y = Math.floor(position.y / cellSize);

    // Defensive: Check for NaN or out-of-bounds
    if (
        isNaN(x) || isNaN(y) ||
        y < 0 || y >= TerrainMap.length ||
        x < 0 || x >= TerrainMap[0].length
    ) {
        console.error(`[TerrainSensitivity] Out of bounds or NaN: (${x}, ${y})`);
        return;
    }

    const terrainType = TerrainMap[y][x];
    const terrain = terrainTypes.find(t => t.type === terrainType);

    if (!terrain) {
        console.error(`[TerrainSensitivity] No terrain found for type: ${terrainType} at (${x}, ${y})`);
        return;
    }

    if (terrain.bounce === 'round') {
        return roundBounce(position, velocity, x, y, cellSize, gridConfig);
    } else if (terrain.bounce === 'square') {
        return squareBounce(position, velocity, x, y, cellSize, gridConfig);
    } else if (terrain.bounce === 'none') {
        if (terrain.velocityModifier !== undefined) {
            velocity.x *= terrain.velocityModifier;
            velocity.y *= terrain.velocityModifier;
            shitHappensVelocity(velocity);
        }
    }
}

function shitHappensVelocity(velocity) {
    if (isNaN(velocity.x)) {
        velocity.x = (Math.random() - 0.5) * 20; // random between -10 and 10
    }
    if (isNaN(velocity.y)) {
        velocity.y = (Math.random() - 0.5) * 20;
    }
}

function shitHappensPosition(position, gridConfig) {
    const minX = 0;
    const minY = 0;
    const maxX = gridConfig.gridWidth * gridConfig.positionScaleFactor;
    const maxY = gridConfig.gridHeight * gridConfig.positionScaleFactor;
    const centerX = maxX / 2;
    const centerY = maxY / 2;

    // If NaN, randomize near center
    if (isNaN(position.x)) {
        position.x = centerX + (Math.random() - 0.5) * 200;
    }
    if (isNaN(position.y)) {
        position.y = centerY + (Math.random() - 0.5) * 200;
    }

    // Clamp to grid bounds if out of bounds
    if (position.x < minX) position.x = minX;
    if (position.x > maxX) position.x = maxX;
    if (position.y < minY) position.y = minY;
    if (position.y > maxY) position.y = maxY;
}

export const DefaultRules = {
    GravityVectorSensitivity: gravityVectorSensitivity,
    TerrainSensitivity: terrainSensitivity
};

// Update updateAUTPositions to call bondingRule for each AUT
export function updateAUTPositions(AUTInstances, DefaultRules, Database, arenaWidth, arenaHeight) {
    const bondTypes = Database.getBondTypeMap();
    AUTInstances.forEach(aut => {
        bondingRule(aut, AUTInstances, bondTypes);

        let positionUpdated = false;
        aut.rules.forEach(ruleName => {
            const ruleFn = DefaultRules[ruleName];
            if (typeof ruleFn === 'function') {
                // If the rule returns true, it handled the position update
                if (ruleFn(aut, Database) === true) {
                    positionUpdated = true;
                }
            }
        });

        // Only update position if no rule handled it
        if (!positionUpdated) {
            aut.position.x += aut.velocity.x;
            aut.position.y += aut.velocity.y;
        }

        // Keep AUTs within bounds
        aut.position.x = Math.max(0, Math.min(arenaWidth - 1, aut.position.x));
        aut.position.y = Math.max(0, Math.min(arenaHeight - 1, aut.position.y));
    });
}