import { createHash } from 'node:crypto';

export const DATA_LENGTH = 256;
export const GENESIS_HASH = '0'.repeat(64);

export type Block = {
    index: number;
    data: string;
    prev_hash: string;
    nonce: number;
    hash: string;
    timestamp: number;
};

export function newBlock(block?: Block): Block {
    if (!block) {
        const index = 0;
        const data = 'genesis';
        const prev_hash = GENESIS_HASH;
        const nonce = 0;
        return {
            index,
            data,
            prev_hash,
            nonce,
            hash: getHash(index, prev_hash, data, nonce),
            timestamp: Date.now(),
        };
    } else {
        const index = block.index + 1;
        const prev_hash = block.hash;
        const data = randomString();
        let nonce = 0;
        let hash = getHash(index, prev_hash, data, nonce);
        while (!isHashValid(hash)) {
            nonce++;
            hash = getHash(index, prev_hash, data, nonce);
        }
        return {
            index,
            data,
            prev_hash,
            hash,
            nonce,
            timestamp: Date.now(),
        };
    }
}

export function blockToString(b: Block) {
    return `(${b.index} prev_hash=${b.prev_hash.substring(
        0,
        4
    )} hash=${b.hash.substring(0, 4)})`;
}

export function getHash(
    index: number,
    prev_hash: string,
    data: string,
    nonce: number
) {
    const toHash = `${index}${prev_hash}${data}${nonce}`;
    return createHash('sha256').update(toHash).digest('hex');
}

export function randomString(): string {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let counter = 0;
    while (counter < DATA_LENGTH) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
        counter += 1;
    }
    return result;
}

export function isHashValid(hash: string) {
    return hash.endsWith('0000');
}

export function validateBlock(b: Block) {
    return (
        isHashValid(b.hash) &&
        b.hash === getHash(b.index, b.prev_hash, b.data, b.nonce)
    );
}
