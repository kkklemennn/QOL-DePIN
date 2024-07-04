# Creating a WASM applet for W3bstream
This directory is structured to facilitate the development, testing and deployment of our secure air monitoring WebAssembly (WASM) applet which runs on the W3bstream platform.

The source code in `assembly` directory implements the applet's functionality.

The `build` directory holds the compiled outputs.

The`node_modules` directory contains the project's dependencies.

The configuration files set up the AssemblyScript environment and testing framework.

### asconfig.json
Configuration file for AssemblyScript, defining compiler options and project settings.

### package.json
Manages project dependencies and scripts for building, testing and running the applet.

### package-lock.json
Locks the versions of dependencies to ensure consistent build across different environments.

# Manual W3bstream setup
## 1. Open W3bstream
- You can either set up a local W3bstream node following the instructions on:
    -   https://github.com/machinefi/w3bstream
- Or acces any of the publicly available development W3bstream nodes:
    -   https://devnet.w3bstream.com/
    -   https://dev.w3bstream.com/

## 2. Create tables in the W3bstream database
In this step we'll create the database tables:
- devices_registry: which keeps track if the device with the device_id is registered and active
- device_binding: which keeps track of which device with the device_id belongs to which owner with owner_address
- data_table: stores all the data (timestamp, temperature, humidity, latitude, longitude, accuracy) received from the devices with device_id.

To set up the databases we can simply use the following SQL commands:

```SQL
CREATE TABLE devices_binding (
    id BIGINT,
    device_id TEXT,
    owner_address TEXT
);


CREATE TABLE data_table (
    id BIGINT,
    device_id TEXT,
    timestamp TEXT,
    temperature REAL,
    humidity REAL,
    lat REAL,
    lon REAL,
    accuracy REAL
);


CREATE TABLE devices_registry (
    id BIGINT,
    device_id TEXT,
    is_registered BOOLEAN,
    is_active BOOLEAN
);
```

## 3. Creating Smart Contract Monitors
Smart Contract Monitors the way of triggering the W3bstream events when a certain on-chain condition is met.

To set up the Smart Contract Monitors we need to set the following parameters:
- Event Type: Name of the W3bstream event that will be triggered by the monitor when a certain condition on the blockchain is met
- Chain ID: Unique identifier for the blockchain which will be monitored (IoTeX Testnet has a Chain ID of 4690)
- Contract Address: Address of the smart contract that we want to monitor
- Block Start: Block number when the monitoring process will begin (this is typically set to the block number when of when the smart contract was deployed)
- Block End: Block number when the monitoring process will stop. If this is set to 0, monitor will run indefinitely.
- Topic0: Keccak-256 hash of the event in the smart contract that we're monitoring.

The monitors that we'll be using:
- DEVICE_REGISTER -> keccak256(DeviceRegistered(bytes32))
- DEVICE_ACTIVATE -> keccak256(DeviceActivated(bytes32))
- DEVICE_REMOVE -> keccak256(DeviceDeleted(bytes32))
- DEVICE_UNBINDING -> keccak256(OwnershipRenounced(bytes32))
- DEVICE_BINDING -> keccak256(OwnershipAssigned(bytes32,address))
- DEVICE_SUSPEND -> keccak256(DeviceSuspended(bytes32))

### Example of setting up a Smart Contract Monitor
This is a practical example of how to set up the Smart Contract Monitor for the DeviceRegistered, which triggers the DEVICE_REGISTER W3bstream event.

For example we deployed the DevicesRegistry smart contract to the testnet with the address [`0xcAF8f6ECb5fCc76429426C207f9821B7c25DB21a`](https://testnet.iotexscan.io/address/io1etu0dm94lnrkg22zdss8lxppklp9mvs6e64l4w).

Here we can see that the contract was deployed at the transaction [`cff5f147305f3d3f96244600835e2e4f45e6a0fd9b2c4f0eb82d692b884baac5`](https://testnet.iotexscan.io/tx/cff5f147305f3d3f96244600835e2e4f45e6a0fd9b2c4f0eb82d692b884baac5) which has the Block Height of `26977507`.

After this we need to calculate the Keccak-256 hash of the desired smart contract event. We can do this using some [online tool](https://emn178.github.io/online-tools/keccak_256.html) or use the Smart Contract Event field when adding the Smart Contract event monitor, which also automatically generates the topic0. We calculate the Keccak-256 of the DeviceRegistered(bytes32) and get the hash: `543b01d8fc03bd0f400fb055a7c379dc964b3c478f922bb2e198fa9bccb8e714`

On W3bstream Events tab under Event Sources we choose the Smart Contract Monitor and click the "Create" button.

Here we input the fields accordingly:
- W3bstream Event Name: `DEVICE_REGISTER`
- Chain ID: `iotex-testnet`
- Contract Address: `0xcAF8f6ECb5fCc76429426C207f9821B7c25DB21a`
- Start Height: `26977507`
- End Height: `0`
- Smart contract Event's topic0: `0x543b01d8fc03bd0f400fb055a7c379dc964b3c478f922bb2e198fa9bccb8e714`

## 4. Set up Event Routing
When the Event that we set up in the Smart Contract Monitor is raised, it needs to be routed to a handler function exported in our applet that is running on the W3bstream.

The Event Types that we'll route to the Handlers are:
- DEFAULT -> handle_data
- DEVICE_REGISTER -> handle_device_registered
- DEVICE_REMOVE -> handle_device_removed
- DEVICE_SUSPEND -> handle_device_suspended
- DEVICE_ACTIVATE -> handle_device_activated
- DEVICE_BINDING -> handle_device_binding
- DEVICE_UNBINDING -> handle_device_unbinding

## 5. Upload the WASM applet
Compile the wasm applet by running the following command:

`npm run asbuild`

This will create the release.wasm file, which contains the logic behind the handlers that we're using.

To upload this file to the W3bstream go to the project settings and click on "Update WASM" button. Select the compiled release.wasm and upload it.