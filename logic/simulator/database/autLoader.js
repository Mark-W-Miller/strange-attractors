import { D_, DB } from '../../../debug/DB.js';

export async function loadAUTTypes(Simulation) {
    const allTypes = [];

    try {
        // Process each AUT file listed in the manifest
        try {
            allTypes.push(...Simulation.autTypes);
            D_(DB.DB_INIT, `[AUT Loader] Loaded AUTs:`, allTypes);
        } catch (error) {
            console.error(`[AUT Loader] Error processing AUT file ${autPath}:`, error);
        }
        D_(DB.DB_INIT, '[AUT Loader] Raw AUT types loaded:', allTypes);
    } catch (error) {
        console.error(`[AUT Loader] Failed to load AUT types:`, error);
    }

    return allTypes;
}

export function resolveAUTType(typeName, allTypes) {
    const typeParts = typeName.split('.').reverse();
    const resolvedType = {};

    // Process each part of the type name
    for (const part of typeParts) {
        const matchingType = allTypes.find(type => type.type === part);
        if (matchingType) {
            mergeDeep(resolvedType, matchingType); // Merge properties recursively
        }
    }

    // Finally, merge the compound type itself
    const compoundType = allTypes.find(type => type.type === typeName);
    if (compoundType) {
        mergeDeep(resolvedType, compoundType);
    }

    return resolvedType;
}

export function buildTypeMap(allTypes) {
    const typeMap = {};

    allTypes.forEach(type => {
        try {
            const resolvedType = resolveAUTType(type.type, allTypes);
            resolvedType.type = type.type; // Ensure the `type` field is preserved
            typeMap[type.name] = resolvedType;
        } catch (error) {
            console.error(`[AUT Loader] Error resolving type ${type.name}:`, error);
        }
    });

    D_(DB.DB_INIT, '[AUT Loader] Processed AUT types:', typeMap);
    return typeMap;
}

function mergeDeep(target, source) {
    for (const key in source) {
        if (key === 'type') {
            // Skip overriding the `type` field
            continue;
        }

        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            // If the value is an object, merge recursively
            target[key] = target[key] || {};
            mergeDeep(target[key], source[key]);
        } else {
            // Otherwise, override the value
            target[key] = source[key];
        }
    }
    return target;
}