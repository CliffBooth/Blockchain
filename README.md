main branch [![Tests](https://github.com/CliffBooth/Blockchain/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/CliffBooth/Blockchain/actions/workflows/test.yml)

develop branch [![Tests](https://github.com/CliffBooth/Blockchain/actions/workflows/test.yml/badge.svg?branch=develop)](https://github.com/CliffBooth/Blockchain/actions/workflows/test.yml)

# Blockchain

A simple blockchain project as part of a university network apps course

## Run docker compose example

``git clone https://github.com/CliffBooth/Blockchain.git``

``cd Blockchain``

``docker build . -t blockchain``

``docker compose up``

This starts 3 nodes in parallel and they start generating blocks until there are 10 in the blockchain. Then each one prints its current blockchain state (each block is represented by index, first 4 prev_hash characters , first 4 hash characters) and quit.

## Testing

- [x] Block module unit tests

### coverage:

Tests coverage:

- block module

| Statements| Functions| Line  |
|-----------|----------|-------|
|   100%    |   100%   |  100% |