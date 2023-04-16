
# Blockchain

A simple blockchain project as part of a university network apps course

## Run docker compose example

``git clone https://github.com/CliffBooth/Blockchain.git``

``cd Blockchain``

``docker build . -t blockchain``

``docker compose up``

This starts 3 nodes in parallel and they start generating blocks until there are 10 in the blockchain. Then each one prints its current blockchain state and quit.

## Testing

- [x] Block module unit tests

### coverage:
Tests coverage:

| Statements| Functions| Line  |
|-----------|----------|-------|
|   100%    |   100%   |  100% |