import { Address, Node } from './node';
import { blocksToGenerate, debug } from './app.config';
import { ArgumentParser } from 'argparse';
import assert from 'node:assert';

const parser = new ArgumentParser({
    description: "Node in a blockchain network"
})

parser.add_argument('-a', '--address', {help: 'address of this node in following format: host:port'})
parser.add_argument('-o', '--other', {help: 'addresses of other nodes in following format: "host1:port1 host2:port2 ..."'})
parser.add_argument('-g', '--genesis', {help: 'optional flag, specifies that this node generates genesis block', action: "store_true"})
parser.add_argument('-b', '--blocks', {help: 'specify how many blocks node should generate, default = 10'})

const args = parser.parse_args()

if (!args.address) {
    throw "option -a is required"
}

if (!args.other) {
    throw "option -o is required"
}

let blocks = blocksToGenerate
const thisAddress = parseAddress(args.address)
const otherAddresses = (args.other as string).split(" ").map(a => parseAddress(a));
if (args.blocks !== undefined) {
    try {
        blocks = parseInt(args.blocks)
    } catch(err) {
        throw "specify number of blocks as a number"
    }
}

if (debug)
    console.log('CONTINUING...', thisAddress, otherAddresses, blocks)

const n = new Node(thisAddress, otherAddresses, args.genesis, blocks, finishedCallback);

function finishedCallback() {
    console.log(`[${thisAddress.host}:${thisAddress.port}] finished\n` 
    + `${n}`)
}

function parseAddress(str: string): Address {
    const hostPort = str.split(":")
    if (hostPort.length !== 2)
        throw "error with address format!"
    try {
        const port = parseInt(hostPort[1])
        assert(!isNaN(port))
        return {
            host: hostPort[0],
            port,
        }
    } catch(err) {
        throw "error with address format!"
    }
}

function parseInt(s: string) {
    const res = Number.parseInt(s)
    assert(!isNaN(res))
    return res
}