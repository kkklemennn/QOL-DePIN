# tasks
This directory contains various Hardhat tasks that automate and streamline interactions with the smart contracts. These tasks provide essential functionalities for managing devices and tokens, making development and maintenance easier.

### index.js
This file includes all the task definitions, ensuring they are loaded and available when running Hardhat commands.

## Task overview

### hello-world
Prints "Hello World!" and the wallet address of the first signer.

Example Call: 

`npx hardhat hello-world`

### check-balance
Checks the token balance of a specified address.

Example Call: 

`npx hardhat check-balance --address <YOUR_ADDRESS> --network testnet`

### check-decimals
Checks the decimal value of the token.

Example Call: 

`npx hardhat check-decimals --network testnet`

### activate-device
Activates a suspended device.

Example Call: 

`npx hardhat activate-device --deviceid <YOUR_DEVICE_ID> --network testnet`

### bind-device
Binds a device to a user.

Example Call: 

`npx hardhat bind-device --deviceid 0xYourDeviceIdHere --userid <YOUR_ADDRESS> --authcode <YOUR_AUTH_CODE> --network testnet`

### register-device
Registers a device.

Example Call: 

`npx hardhat register-device --deviceid <YOUR_DEVICE_ID> --authcode <YOUR_AUTH_CODE> --network testnet`

### remove-device
Removes a registered device.

Example Call: 

`npx hardhat remove-device --deviceid <YOUR_DEVICE_ID> --network testnet`

### device-status
Outputs the details of a device from the devices mapping.

Example Call: 

`npx hardhat device-status --deviceid <YOUR_DEVICE_ID> --network testnet`

### suspend-device
Suspends a registered device.

Example Call: 

`npx hardhat suspend-device --deviceid <YOUR_DEVICE_ID> --network testnet`

### unbind-device
Unbinds a device from its owner.

Example Call: 

`npx hardhat unbind-device --deviceid <YOUR_DEVICE_ID> --network testnet`

### add-erc20-minter
Grants ERC20 token minter role to an address.

Example Call: 

`npx hardhat add-erc20-minter --address <YOUR_ADDRESS> --network testnet`

### check-minter-role
Checks if an address has the minter role.

Example Call: 

`npx hardhat check-minter-role --address <YOUR_ADDRESS> --network testnet`

### remove-erc20-minter
Revokes ERC20 token minter role from an address.

Example Call: 

`npx hardhat remove-erc20-minter --address <YOUR_ADDRESS> --network testnet`

### get-device-owner
Gets the owner of a given device.

Example Call: 

`npx hardhat get-device-owner --deviceid <YOUR_DEVICE_ID> --network testnet`

### get-owner-devices
Gets all devices owned by a given address.

Example Call: 

`npx hardhat get-owner-devices --userid <YOUR_ADDRESS> --network testnet`