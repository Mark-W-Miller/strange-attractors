export async function loadAUTTypes(directory = '../data/auts') {
    const allTypes = [];

    try {
        // Fetch the manifest file
        const response = await fetch(`${directory}/manifest.json`);
        if (!response.ok) {
            throw new Error(`[AUT Loader] Failed to fetch manifest file from ${directory}: ${response.statusText}`);
        }

        const files = await response.json(); // Parse the JSON array of filenames
        if (!Array.isArray(files)) {
            throw new Error(`[AUT Loader] Expected a JSON array of filenames, but received: ${files}`);
        }

        // Fetch and process each file listed in the manifest
        for (const file of files) {
            try {
                const fileResponse = await fetch(`${directory}/${file}`);
                if (!fileResponse.ok) {
                    throw new Error(`[AUT Loader] Failed to fetch AUT file: ${file}`);
                }

                const types = await fileResponse.json(); // Parse the JSON content
                allTypes.push(...types);
            } catch (error) {
                console.error(`[AUT Loader] Error processing AUT file ${file}:`, error);
            }
        }
    } catch (error) {
        console.error(`[AUT Loader] Failed to load AUT types:`, error);
    }

    return allTypes;
}

export function resolveAUTType(typeName, allTypes) {
    const typeParts = typeName.split('.').reverse();
    const resolvedType = {};

    for (const part of typeParts) {
        const matchingType = allTypes.find(type => type.type === part);
        if (matchingType) {
            mergeDeep(resolvedType, matchingType); // Merge properties recursively
        }
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