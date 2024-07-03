# blockchain
This directory contains all the necessary components for developing, deploying and testing smart contracts on the IoTeX network. This includes Solidity contract files, deployment scripts, testing framewrosk and various configuration files.

`contracts` directory contains all the Solidity files for the smart contract.

`deploy` directory contains scripts for deploying the smart contracts on the IoTeX network

`tasks` directory include various Hardhat tasks which are used to interact with the smart contracts.

`test` directory contains all the test for the smart contracts, which are used during the developing process, to ensure that they are working as expected, prior to deploying the final version.

### deployments.json
Keeps track of all the deployed contracts and their related information such as network (chain id), address, application binary interface (ABI).

### hardhat.config.js
Configuration file for Hardhat, specifying network settings, compiler options and plugin configurations.

### package.json
Manages project dependencies and scripts for building, testing and deploying the smart contracts.

### package-lock.json
Locks the versions of dependencies to ensure consistent builds.

## HIW

## Relevant commands

Run tests:

```bash
npm run test
```

Deploy smart contracts in hardhat envoronment:

```bash
npm run deploy
```

Deploy smart contracts to testnet:

```bash
npm run deploy:testnet
```


## IMPORTANT INFO
To be able to mint tokens, we need to:
- grant w3bstream operator address the minter role
- fund the operator address with some IOTX

To be able to see them in the metamask wallet, we need to:
- import the token contract to metamask

## Event hashes:

### DeviceRegistered(bytes32): 
0x543b01d8fc03bd0f400fb055a7c379dc964b3c478f922bb2e198fa9bccb8e714

### OwnershipAssigned(bytes32,address): 
0x79e9049c280370b9eda34d20f57456b7dcc94e83ac839777f71209901f780f48