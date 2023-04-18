import net from 'node:net';
import chalk from 'chalk';
import { Block, blockToString, newBlock, validateBlock } from './block';
import { debug } from './app.config'

export type Address = {
    host: string;
    port: number;
};

export class Node {
    private address: Address;
    private other_nodes: Address[];
    private genesis: boolean;
    private index: number;

    private chain: Block[] = [];

    //for debugging
    static counter = 0;
    private static colors = [chalk.green, chalk.red, chalk.yellow];

    private nextBlockCandidates: Block[] = [];
    private otherReceivedBlocks: Block[] = [];

    private server?: net.Server;

    private toGenerate = 5;
    private callback?: () => void;

    /**
     * @param address - address of this node
     * @param other_nodes - addresses of other nodes
     * @param genesis - does this node generate the genesis block
     * @param toGenerate - how many blocks to generate
     * @param callback - callback that will be called when all blocks are generated
     */
    constructor(
        address: Address,
        other_nodes: Address[],
        genesis = false,
        toGenerate?: number,
        callback?: () => void,
        index?: number
    ) {
        if (toGenerate) this.toGenerate = toGenerate;
        if (callback) this.callback = callback;
        this.address = address;
        this.other_nodes = other_nodes;
        this.genesis = genesis;
        if (index) this.index = index;
        else this.index = Node.counter++;
        this.listen();
        if (genesis) setTimeout(() => this.startGenerating(), 500);
    }

    private listen() {
        const server = net.createServer();
        this.server = server;
        server.listen(this.address.port, this.address.host, () => {
            this.log(`started listening on ${this.address.port}`);
        });

        server.on('connection', socket => {
            socket.on('data', data => {
                const block = JSON.parse(data.toString()) as Block;
                if (this.chain.length === 0) {
                    this.chain.push(block);
                    this.startGenerating();
                } else {
                    //validate block
                    if (!validateBlock(block))
                        return;
                    if (this.isNextBlock(block))
                        this.nextBlockCandidates.push(block);
                    else this.otherReceivedBlocks.push(block);

                    this.log(
                        `got data, receivedBlocks = [${this.nextBlockCandidates
                            .map(b => b.index)
                            .join(' ')}],` +
                            ` otherBlocks = [${this.otherReceivedBlocks
                                .map(b => b.index)
                                .join(' ')}]`
                    );
                }
            });
        });

        server.on('close', () => {
            this.log('server closed');
        });
    }

    private async startGenerating() {
        let generated = 0;
        this.log('starting generating');
        while (
            this.genesis
                ? generated < this.toGenerate
                : generated < this.toGenerate - 1
        ) {
            //not genesis node generates 1 block less
            if (this.genesis && this.chain.length === 0) {
                const block = newBlock();
                this.chain.push(block);
                console.log(`generated genesis block`)
                this.log('BROADCASTING GENESIS');
                await this.broadCastBlock(block);
                generated++;
            } else {
                this.log(this)
                this.log(
                    `generating block number ${
                        this.chain[this.chain.length - 1].index + 1
                    }`
                );
                const last = this.chain[this.chain.length - 1];
                const block = newBlock(last);
                this.nextBlockCandidates.push(block);
                // console.log(`[${this.address.host}:${this.address.port}] generated ${this.chain[this.chain.length - 1].index + 1} / ${this.toGenerate}`)
                this.log(
                    `BROADCASTING ${
                        this.chain[this.chain.length - 1].index + 1
                    }`
                );
                await this.broadCastBlock(block);
                //wait until blocks from all other nodes received
                await new Promise<void>(async resolve => {
                    while (
                        this.nextBlockCandidates.length !==
                        this.other_nodes.length + 1
                    ) {
                        await new Promise<void>(resolve =>
                            setTimeout(() => resolve(), 1)
                        );
                    }
                    resolve();
                });

                const toAdd = this.nextBlockCandidates.reduce((a, b) =>
                    a.timestamp < b.timestamp ? a : b
                );
                this.log(`adding block: ${blockToString(toAdd)}`);
                this.chain.push(toAdd);
                console.log(`[${this.address.host}:${this.address.port}] added ${this.chain[this.chain.length - 1].index + 1} / ${this.toGenerate}`)

                this.nextBlockCandidates = this.otherReceivedBlocks; //since we can only next index blocks in the otherReceivedBlocks
                this.otherReceivedBlocks = [];
                await new Promise<void>(resolve =>
                    setTimeout(() => resolve(), 1)
                );
                generated++;
            }
        }
        //when everything is generated, close server
        this.server!.close();
        if (this.callback) {
            this.callback();
        }
    }

    private async broadCastBlock(block: Block) {
        const toSend = JSON.stringify(block);
        const promises: Promise<void>[] = []

        this.other_nodes.forEach(adr => {
            promises.push(new Promise(resolve => {
                const client = new net.Socket();
                client.connect(adr.port, adr.host)
                client.on('connect', () => {
                    client.write(toSend);
                    client.destroy();
                    resolve()
                })
                client.on('error', async (err: Error) => {
                    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
                    client.connect(adr.port, adr.host)
                })
            }))
        });

        await Promise.all(promises)
    }

    private isNextBlock(b: Block) {
        const lastBlock = this.chain[this.chain.length - 1];
        if (b.prev_hash === lastBlock.hash && b.index === lastBlock.index + 1)
            return true;
        return false;
    }

    private log(...s: any[]) {
        if (!debug) return
        const colorPrint = Node.colors[this.index % 3];
        console.log(colorPrint(`[${this.address.host}:${this.address.port}]`, s));
    }

    toString() {
        if (this.chain.length === 0) return '[]'
        let res = `[ ${blockToString(this.chain[0])} `
        for (let i = 1; i < this.chain.length; i++) {
            res += `${blockToString(this.chain[i])} `
        }
        res += ']'
        return res
    }
}
