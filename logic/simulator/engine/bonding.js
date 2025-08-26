import { D_, DB } from '../../../debug/DB.js';
import { Database } from '../database/database.js'; // Import Database

function getStructureLeaves(structure, parentPos = { x: 0, y: 0 }) {
    // Recursively collect all leaf AUTs with their absolute positions
    if (!structure.children || !Array.isArray(structure.children)) return [];
    const absPos = {
        x: (structure.position?.x || 0) + parentPos.x,
        y: (structure.position?.y || 0) + parentPos.y
    };
    let leaves = [];
    structure.children.forEach(child => {
        if (child.type === 'structure') {
            leaves = leaves.concat(getStructureLeaves(child, absPos));
        } else {
            leaves.push({
                aut: child,
                position: {
                    x: (child.position?.x || 0) + absPos.x,
                    y: (child.position?.y || 0) + absPos.y
                }
            });
        }
    });
    return leaves;
}

export function bondingRule(aut, AUTInstances, bondTypes) {
    const bondDefs = bondTypes[aut.type] || [];
    if (aut.bondedTo) {
        const partner = AUTInstances.find(a => a.id === aut.bondedTo);
        if (partner) {
            const bondDef = bondDefs.find(b => b.to === partner.type && b.type === 'attraction');
            if (bondDef) {
                handleAttractionBond(aut, partner, bondDef);
            }
        }
    }
    for (const bondDef of bondDefs) {
        const radius = aut.graphics.size;
        for (const candidate of AUTInstances.slice()) {
            // --- Structure collision handling ---
            if (candidate.type === 'structure') {
                const leaves = getStructureLeaves(candidate);
                let foundCollision = false;
                for (const { aut: leaf, position: leafPos } of leaves) {
                    if (leaf.type === bondDef.to && leaf !== aut) {
                        const dx = leafPos.x - aut.position.x;
                        const dy = leafPos.y - aut.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= radius) {
                            // Use leaf AUT and its position for bond handling
                            if (bondDef.type === 'absorb') {
                                handleAbsorbBond(aut, leaf, bondDef);
                                foundCollision = true;
                                break;
                            }
                            if (
                                !aut.bondedTo &&
                                bondDef.type === 'attraction' &&
                                !leaf.bondedTo &&
                                (!aut.graphics.bondSize || aut.graphics.size >= aut.graphics.bondSize)
                            ) {
                                handlePairBond(aut, leaf, bondDef);
                                foundCollision = true;
                                break;
                            }
                            if (bondDef.type === 'kill') {
                                handleKillBond(aut, leaf, bondDef);
                                foundCollision = true;
                                break;
                            }
                            if (bondDef.type === 'lockPosition') {
                                handleLockPositionBond(aut, candidate, bondDef);
                                foundCollision = true;
                                break;
                            }
                        }
                    }
                }
                if (foundCollision) break; // Only first found leaf is used
                continue;
            }
            // --- Regular AUT collision handling ---
            if (
                candidate.type === bondDef.to &&
                candidate !== aut
            ) {
                const dx = candidate.position.x - aut.position.x;
                const dy = candidate.position.y - aut.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    if (bondDef.type === 'absorb') {
                        handleAbsorbBond(aut, candidate, bondDef);
                        continue;
                    }
                    if (
                        !aut.bondedTo &&
                        bondDef.type === 'attraction' &&
                        !candidate.bondedTo &&
                        (!aut.graphics.bondSize || aut.graphics.size >= aut.graphics.bondSize)
                    ) {
                        handlePairBond(aut, candidate, bondDef);
                        return;
                    }
                    if (bondDef.type === 'kill') {
                        handleKillBond(aut, candidate, bondDef);
                        return;
                    }
                    if (bondDef.type === 'lockPosition') {
                        handleLockPositionBond(aut, candidate, bondDef);
                        return;
                    }
                }
            }
        }
    }
}

// --- Bond Type Handlers ---

function handleAttractionBond(aut, partner, bondDef) {
    const dx = partner.position.x - aut.position.x;
    const dy = partner.position.y - aut.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    aut.velocity.x += nx * bondDef.strength;
    aut.velocity.y += ny * bondDef.strength;
}

function handleAbsorbBond(aut, candidate, bondDef) {
    aut.physics.mass += bondDef.massAbsorb * (candidate.physics?.mass || 1);
    const newSize = aut.graphics.size + bondDef.sizeGrowth * (candidate.graphics?.size || 1);
    aut.graphics.size = aut.graphics.maxSize
        ? Math.min(newSize, aut.graphics.maxSize)
        : newSize;
    Database.removeAUTInstanceById(candidate.id);
    D_(DB.EVENTS, `Absorb: ${aut.id} (${aut.type}) absorbed ${candidate.id} (${candidate.type})`);
    checkAndSplitAUT(aut);
}

function handlePairBond(aut, candidate, bondDef) {
    aut.bondedTo = candidate.id;
    candidate.bondedTo = aut.id;
    checkAndSplitAUT(aut);
    D_(DB.EVENTS, `Bonded: ${aut.id} (${aut.type}) <-> ${candidate.id} (${candidate.type})`);
}

function handleKillBond(aut, candidate, bondDef) {
    candidate.graphics.size -= bondDef.damage;
    D_(DB.EVENTS, `Kill: ${aut.id} (${aut.type}) damaged ${candidate.id} (${candidate.type}) by ${bondDef.damage}. New size: ${candidate.graphics.size}`);
    if (candidate.graphics.size <= 0) {
        Database.removeAUTInstanceById(candidate.id);
        D_(DB.EVENTS, `Kill: ${candidate.id} (${candidate.type}) was destroyed.`);
    }
    Database.removeAUTInstanceById(aut.id);
    D_(DB.EVENTS, `Kill: ${aut.id} (${aut.type}) self-destructed after attack.`);
}

function handleLockPositionBond(aut, candidate, bondDef) {
    // Calculate the midpoint between the two AUTs for the structure's position
    const dx = candidate.position.x - aut.position.x;
    const dy = candidate.position.y - aut.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Lock them 'size' distance apart
    const lockDistance = aut.graphics.size;
    const angle = Math.atan2(dy, dx);

    // Structure position is the midpoint
    const structureX = (aut.position.x + candidate.position.x) / 2;
    const structureY = (aut.position.y + candidate.position.y) / 2;

    // Set child positions relative to structure
    const autRelPos = {
        x: -lockDistance / 2 * Math.cos(angle),
        y: -lockDistance / 2 * Math.sin(angle)
    };
    const candidateRelPos = {
        x: lockDistance / 2 * Math.cos(angle),
        y: lockDistance / 2 * Math.sin(angle)
    };


    // Calculate total mass and momentum
    const autMass = aut.physics.mass || 1;
    const candidateMass = candidate.physics.mass || 1;
    const totalMass = autMass + candidateMass;

    const totalMomentum = {
        x: (aut.velocity.x * autMass) + (candidate.velocity.x * candidateMass),
        y: (aut.velocity.y * autMass) + (candidate.velocity.y * candidateMass)
    };

    const structureVelocity = {
        x: totalMomentum.x / totalMass,
        y: totalMomentum.y / totalMass
    };
    // Zero velocities for children
    aut.velocity = { x: 0, y: 0 };
    candidate.velocity = { x: 0, y: 0 };

    // Build structure AUT (binary tree: left and right)
    const structureAUT = {
        id: `structure-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: 'structure',
        position: { x: structureX, y: structureY },
        velocity: structureVelocity,
        physics: { mass: totalMass },
        graphics: {
            size: aut.graphics.size + candidate.graphics.size,
            shape: 'structure'
        },
        rules: Array.from(new Set([
            ...(Array.isArray(aut.rules) ? aut.rules : []),
            ...(Array.isArray(candidate.rules) ? candidate.rules : [])
        ])),
        children: [
            {
                ...aut,
                inStructure: true,
                position: autRelPos,
                velocity: { x: 0, y: 0 }
            },
            {
                ...candidate,
                inStructure: true,
                position: candidateRelPos,
                velocity: { x: 0, y: 0 }
            }
        ]
    };

    // Remove the original AUTs from the instance list
    Database.removeAUTInstanceById(aut.id);
    Database.removeAUTInstanceById(candidate.id);

    // Add the new structure AUT to the instance list
    Database.AUTInstances.push(structureAUT);

    D_(DB.EVENTS, `LockPosition: Created structure AUT ${structureAUT.id} from ${aut.id} and ${candidate.id}.`);
}

/**
 * Checks if the AUT has reached splitSize and splits it in two if needed.
 * Removes pair bonds on the original, resets its size and mass, and creates new AUTs as specified by splitTo.
 */
function checkAndSplitAUT(aut) {
    const splitSize = aut.graphics.splitSize;
    if (!splitSize || aut.graphics.size < splitSize) return;

    const splitToList = aut.graphics.splitTo || [aut.type, aut.type];

    if (aut.bondedTo) {
        const originalSize = splitSize / splitToList.length;
        const originalMass = aut.physics.mass / splitToList.length;
        const partner = Database.AUTInstances.find(a => a.id === aut.bondedTo);
        if (partner) partner.bondedTo = null;
        aut.bondedTo = null;
        aut.graphics.size = originalSize;
        aut.physics.mass = originalMass;
        splitToList.forEach((splitType, idx) => {
            if (idx === 0) return;
            const typeDef = Database.AUTTypes[splitType];
            if (!typeDef) {
                D_(DB.EVENTS, `Split: AUT type ${splitType} not found in AUTTypes.`);
                return;
            }
            const newAUT = {
                id: `${splitType}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                type: splitType,
                position: {
                    x: aut.position.x + (originalSize * idx),
                    y: aut.position.y + (originalSize * idx)
                },
                velocity: { x: -aut.velocity.x, y: -aut.velocity.y },
                bondedTo: null,
                rules: typeDef.rules ? [...typeDef.rules] : [],
                physics: { ...typeDef.physics, mass: originalMass },
                graphics: { ...typeDef.graphics, size: originalSize, splitSize: typeDef.graphics.splitSize, splitTo: typeDef.graphics.splitTo }
            };
            Database.AUTInstances.push(newAUT);
            D_(DB.EVENTS, `Split: Created AUT ${newAUT.id} (${splitType}) at (${newAUT.position.x}, ${newAUT.position.y}).`);
        });
        D_(DB.EVENTS, `Split: ${aut.id} (${aut.type}) split into ${splitToList.length} AUTs.`);
    } else {
        aut.graphics.size = splitSize;
        D_(DB.EVENTS, `Size capped: ${aut.id} (${aut.type}) size set to splitSize (${splitSize}).`);
    }
}