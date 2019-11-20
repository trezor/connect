/* @flow */

export async function resolveAfter(msec: number, value: any) {
    return await new Promise((resolve) => {
        setTimeout(resolve, msec, value);
    });
}
