import {
    Block,
    newBlock,
    DATA_LENGTH,
    GENESIS_HASH,
    getHash,
    randomString,
    isHashValid,
    validateBlock,
    blockToString
} from '../src/block';

describe('testing block module', () => {
    test('getHash', () => {
        const index = 1;
        const prev_hash =
            '437fda829512a9f356efa8e4e04fc52b6bacf7e4e4975ec635676550e58986d3';
        const data =
            'jKqy6uAEaQu6DUXdoOjw0IxT6VkRgrUrod6uXDdlwzybQsf9oULrVWLx6PMSkfoKcJz6WZVQo2BINA28UqZ1VZwisIvER34VhfZ7NrzLvFB9wRdH9ESLa2tWOwQg63GXj9lyYxxVNXwaxEkDmsJCxe9OpGGD5klxMEo0hd7i056pyNZAavoZ90ND3jU5OYiTJrNAFqueduCxizuhJ1Hb5OYSnw1fP9qc7ouBq33O6wFeMnJUW8dwvOjSQmSnMaI2';
        const nonce = 57148;
        const hash = getHash(index, prev_hash, data, nonce);
        expect(hash).toBe(
            'a6f57ffce6393a6564f60b3c7fe83da550dace77271968581ba70c77d1c00000'
        );
    });

    test('random string', () => {
        const string = randomString()
        expect(string.length).toBe(DATA_LENGTH)
    });

    test('isHashValid', () => {
        const valid = '47da8d35550b0f8a1900529cca72883ec205feed6c3fdaa79ee7a81c99b30000'
        const invalid1 = 'a6f57ffce6393a6564f60b3c7fe83da550dace77271968581ba70c77d1a000'
        const invalid2 = 'hello'
        expect(isHashValid(valid)).toBe(true)
        expect(isHashValid(invalid1)).toBe(false)
        expect(isHashValid(invalid2)).toBe(false)
    });

    test('validate block', () => {
        const validBlock = {
            index: 1, 
            data: '5NZFo68UuEawn1CkLu8bhP2JxQYyDbiNsYBt85n5AG1SVJKQp9DUdjlI7OaOg3fj6Q4Tw0dizMQdtCFPQ2QyhPX4jhhg8t21PBxyhs3AE6IuwcdeFnKAz2NP0Hj9HQEp5cbeYrNsjkjSKLpQzkBqUUO4jvYgwXSSyh0CJDPQoyPtjeDg4Sor7LPyBKFgG64majGcGKYGPcNfRN147XqdhhJwmcRnv3yfZ60Gpgvc1ykm4Sl3Vi9JiBAWPojEKq22',
            prev_hash: '437fda829512a9f356efa8e4e04fc52b6bacf7e4e4975ec635676550e58986d3',
            hash: '47da8d35550b0f8a1900529cca72883ec205feed6c3fdaa79ee7a81c99b30000',
            nonce: 15615,
            timestamp: 1681647019648
        }
        const invalidBlock = {
            index: 1, 
            data: 'fake data',
            prev_hash: '437fda829512a9f356efa8e4e04fc52b6bacf7e4e4975ec635676550e58986d3',
            hash: '47da8d35550b0f8a1900529cca72883ec205feed6c3fdaa79ee7a81c99b30000',
            nonce: 15615,
            timestamp: 1681647019648
        }
        expect(validateBlock(validBlock)).toBe(true)
        expect(validateBlock(invalidBlock)).toBe(false)
    })

    test('genesis block', () => {
        const block = newBlock();
        expect(block.data).toBe('genesis');
        expect(block.prev_hash).toBe(GENESIS_HASH);
        expect(block.index).toBe(0);
    });

    test('chain of blocks', () => {
        const genesis = newBlock();
        const chain: Block[] = [];
        for (let i = 0; i < 5; i++) {
            if (i === 0) chain.push(newBlock(genesis));
            else chain.push(newBlock(chain[i - 1]));
        }

        for (let i = 0; i < 5; i++) {
            const block = chain[i];
            if (i === 0) {
                expect(block.prev_hash).toBe(genesis.hash);
                expect(block.index).toBe(1);
                expect(block.data.length).toBe(DATA_LENGTH);
            } else {
                const prevBlock = chain[i - 1];
                expect(block.prev_hash).toBe(prevBlock.hash);
                expect(block.index).toBe(prevBlock.index + 1);
                expect(block.data.length).toBe(DATA_LENGTH);
                expect(block.hash.substring(block.hash.length - 4)).toBe(
                    '0000'
                );
            }
        }
    });

    test('blockToString', ()=> {
        const block = {
            index: 1, 
            data: '5NZFo68UuEawn1CkLu8bhP2JxQYyDbiNsYBt85n5AG1SVJKQp9DUdjlI7OaOg3fj6Q4Tw0dizMQdtCFPQ2QyhPX4jhhg8t21PBxyhs3AE6IuwcdeFnKAz2NP0Hj9HQEp5cbeYrNsjkjSKLpQzkBqUUO4jvYgwXSSyh0CJDPQoyPtjeDg4Sor7LPyBKFgG64majGcGKYGPcNfRN147XqdhhJwmcRnv3yfZ60Gpgvc1ykm4Sl3Vi9JiBAWPojEKq22',
            prev_hash: '437fda829512a9f356efa8e4e04fc52b6bacf7e4e4975ec635676550e58986d3',
            hash: '47da8d35550b0f8a1900529cca72883ec205feed6c3fdaa79ee7a81c99b30000',
            nonce: 15615,
            timestamp: 1681647019648
        }
        const str = '(1 prev_hash=437f hash=47da)'
        expect(blockToString(block)).toBe(str)
    })
});
