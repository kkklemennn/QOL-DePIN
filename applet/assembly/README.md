# assembly
Contains the AssemblyScript source code and related configuration files.

`utils` directory contains all the utility scripts and functions used by the applet.

### handlers.ts
The handlers manage the entire lifecycle of IoT devices within the W3bstream ecosystem, from initial registration and binding, to data handling and reward distribution. Handler functions handle various device events such as registration, removal, suspension, activation, binding and unbinding. Each handler logs the event, processes the incoming message and updates the device status in SQL database accordingly.
The main function is the `handle_data` function which processes incoming data messages from devices. It validates the message, verifies the deviec signature, ensures that the device is active and has an assigned owner, and then stores the IoT data in the database.
At the end, this function also triggers the reward processing based on received data.

### helpers.ts
Contains helper functions used by handlers for various tasks, mainly for parsing data from JSON objects.

### tsconfig.json
This is the TypeScript configuration file which specifies the compiler options for the TypeScript compiler (tsc), guiding how the TypeScript code should be transpiled to Assembly Script.