/* @flow */

export const versionCompare = (a: string | number[], b: string | number[]) => {
    const pa = typeof a === 'string' ? a.split('.') : a;
    const pb = typeof b === 'string' ? b.split('.') : b;
    if (!Array.isArray(pa) || !Array.isArray(pb)) return 0;
    let i;
    for (i = 0; i < 3; i++) {
        const na = Number(pa[i]);
        const nb = Number(pb[i]);
        if (na > nb) return 1;
        if (nb > na) return -1;
        if (!isNaN(na) && isNaN(nb)) return 1;
        if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
};
