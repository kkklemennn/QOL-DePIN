# IoTeX based secure air monitoring DePIN

The goal of this project is to propose the optimal solution for integrating blockchain technology with lightweight devices such as IoT sensors and mobile platforms. This project leverages IoTeX blockchain technology and the W3bstream platform to ensure data integrity, security, and efficiency in air quality monitoring. Additionally, it incorporates a simple economic model where users are rewarded with tokens for their contributions, fostering greater participation and network growth. The scalability and network effect ensure that as more users join, the DePIN (Decentralized Physical Infrastructure Network) becomes more valuable and effective. The project is organized into the following components:

## Directory overview

### applet
The applet directory contains the essential components for generating a WebAssembly (WASM) applet that runs on the W3bstream platform. It includes configuration files, handler scripts for processing events, utility functions, and the compiled WASM binary. This setup allows the applet to manage device events, interact with smart contracts, and facilitate secure data handling and reward distribution on the W3bstream network.

### arduino
The Arduino directory contains the comprehensive code for developing and deploying a secure air monitoring sensor. It includes individual functionality tests, utility scripts for tasks such as key generation and Wi-Fi scanning, and the integrated production code for the sensor. This setup enables the sensor to read data, manage connections, and securely communicate with W3bstream and HomeAssistant.

### blockchain
The blockchain directory contains the code for the smart contract development and deployment for the project. It includes Solidity contracts, deployment scripts, testing frameworks, and configuration files. This setup ensures efficient contract management, from development and testing to deployment on the IoTeX network, enabling secure device registration, ownership management, and token operations.

### homeassistant
The homeassistant directory contains custom integration code for connecting the secure air monitoring sensors to Home Assistant. It includes configuration files and scripts that enable seamless communication between the sensors and Home Assistant, allowing for real-time monitoring and interaction with the sensors within the Home Assistant ecosystem.

### magbtc-device-manager-webapp
The react-webapp directory contains the source code and configuration for a React-based web application. It includes frontend components, backend API server scripts, and configuration files. This setup allows users to manage IoT devices, including binding, unbinding, activation, and suspension. Additionally, it provides functionality for viewing the amount of rewarded tokens.

### pysim
The pysim directory provides a Python-based simulation tool for testing the W3bstream integration. It includes scripts that generate random sensor data or use the hardcoded payload and send it to the W3bstream endpoint, facilitating the testing and validation of the W3bstream setup without needing physical devices.

## Workflow

TODO
