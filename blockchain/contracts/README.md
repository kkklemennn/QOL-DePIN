# contracts
This directory contains the Solidity smart contracts that define the core functionalities for the IoTeX based secure air monitoring DePIN project. These contracts handle device registration, management, and token operations necessary for the project's decentralized infrastructure.

### DevicesRegistry.sol
This smart contract manages the lifecycle and ownership of devices within the network.
It includes functionalities for registering, suspending, activating, binding and unbinding the devices.

### Token.sol
This ERC20 token contract implements a customizable token used for rewarding device owners within the network. It includes roles for minting and burning tokens, ensuring controlled token supply management. In our case this role has the W3bstream node operator.

Sourced from OpenZeppelin Docs: https://docs.openzeppelin.com/contracts/4.x/access-control