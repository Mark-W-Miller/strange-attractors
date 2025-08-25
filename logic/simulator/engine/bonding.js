import { D_, DB } from '../../../debug/DB.js';

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
            const bondDef = bondDefs.find(b => b.to === partner.type);
            if (bondDef && bondDef.type === 'attraction') {
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
        for (const candidate of AUTInstances) {
            if (
                candidate.type === bondDef.to &&
                candidate !== aut
            ) {
                const dx = candidate.position.x - aut.position.x;
                const dy = candidate.position.y - aut.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    if (bondDef.type === 'absorb') {
                        // Absorb: remove candidate and increase aut's mass and size
                        aut.physics.mass += bondDef.massAbsorb * (candidate.physics?.mass || 1);
                        aut.graphics.size += bondDef.sizeGrowth * (candidate.graphics?.size || 1);
                        const idx = AUTInstances.indexOf(candidate);
                        if (idx !== -1) AUTInstances.splice(idx, 1);
                        D_(DB.EVENTS, `Absorb: ${aut.id} (${aut.type}) absorbed ${candidate.id} (${candidate.type})`);
                        return;
                    }
                    if (!aut.bondedTo && bondDef.type === 'attraction' && !candidate.bondedTo) {
                        aut.bondedTo = candidate.id;
                        candidate.bondedTo = aut.id;
                        D_(DB.EVENTS, `Bonded: ${aut.id} (${aut.type}) <-> ${candidate.id} (${candidate.type})`);
                        return;
                    }
                }
            }
        }
    }
}