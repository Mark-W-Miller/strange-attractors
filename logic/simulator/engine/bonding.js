import { D_, DB } from '../../../debug/DB.js';
import { Database } from '../database/database.js'; // Import Database

/**
 * Evaluates bonding for a single AUT.
 * If already bonded, adjusts velocity toward partner.
 * If not bonded, looks for a nearby unbonded partner of required type and bonds them.
 * If bond type is 'absorb', absorbs the candidate: increases mass and size, removes candidate.
 */
export function bondingRule(aut, AUTInstances, bondTypes) {
    const bondDefs = bondTypes[aut.type] || [];
    // If already bonded, adjust velocity toward partner
    if (aut.bondedTo) {
        const partner = AUTInstances.find(a => a.id === aut.bondedTo);
        if (partner) {
            const bondDef = bondDefs.find(b => b.to === partner.type && b.type === 'attraction');
            if (bondDef) {
                const dx = partner.position.x - aut.position.x;
                const dy = partner.position.y - aut.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist;
                const ny = dy / dist;
                aut.velocity.x += nx * bondDef.strength;
                aut.velocity.y += ny * bondDef.strength;
            }
        }
        // Continue to check for absorb bonds even if already bonded
    }
    // Check for absorb bonds and handle absorption
    for (const bondDef of bondDefs) {
        const radius = aut.graphics.size;
        for (const candidate of AUTInstances.slice()) { // Use slice to avoid mutation issues
            if (
                candidate.type === bondDef.to &&
                candidate !== aut
            ) {
                const dx = candidate.position.x - aut.position.x;
                const dy = candidate.position.y - aut.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    if (bondDef.type === 'absorb') {
                        aut.physics.mass += bondDef.massAbsorb * (candidate.physics?.mass || 1);
                        aut.graphics.size += bondDef.sizeGrowth * (candidate.graphics?.size || 1);
                        Database.removeAUTInstanceById(candidate.id); // Use Database function instead of direct splice
                        D_(DB.EVENTS, `Absorb: ${aut.id} (${aut.type}) absorbed ${candidate.id} (${candidate.type})`);
                        checkAndSplitAUT(aut); // <-- Add this call
                        continue;
                    }
                    if (!aut.bondedTo && bondDef.type === 'attraction' && !candidate.bondedTo) {
                        aut.bondedTo = candidate.id;
                        candidate.bondedTo = aut.id;
                        D_(DB.EVENTS, `Bonded: ${aut.id} (${aut.type}) <-> ${candidate.id} (${candidate.type})`);
                        return; // Return after first pair bond
                    }
                }
            }
        }
    }
}

/**
 * Checks if the AUT has reached splitSize and splits it in two if needed.
 * Removes pair bonds on the original, resets its size and mass, and creates a new AUT nearby.
 */
function checkAndSplitAUT(aut) {
    const splitSize = aut.graphics.splitSize;
    if (!splitSize || aut.graphics.size < splitSize) return;

    // Save original size and mass
    const originalSize = splitSize / 2;
    const originalMass = aut.physics.mass / 2;

    // Remove pair bond on original and its partner
    if (aut.bondedTo) {
        const partner = Database.AUTInstances.find(a => a.id === aut.bondedTo);
        if (partner) partner.bondedTo = null;
        aut.bondedTo = null;
    }

    // Reset original AUT's size and mass
    aut.graphics.size = originalSize;
    aut.physics.mass = originalMass;

    // Create new AUT instance (clone)
    const newAUT = {
        ...aut,
        id: `${aut.type}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        position: {
            x: aut.position.x + originalSize,
            y: aut.position.y + originalSize
        },
        velocity: { x: -aut.velocity.x, y: -aut.velocity.y },
        bondedTo: null
    };
    Database.AUTInstances.push(newAUT);

    D_(DB.EVENTS, `Split: ${aut.id} (${aut.type}) split into two AUTs.`);
}