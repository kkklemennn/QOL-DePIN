import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { registryABI, deviceBindingABI, tokenABI } from './abis';

const registryAddress  = "0x3Dc485d4AB966f7e526D679A9aF44F1be4a04c23";
const deviceBindingAddress = "0x06735BECaC4805e02da41ae1402fC3d11d3fbff9";
const tokenAddress = "0x911c3A704c6b5954Aa4d698fb41C77D06d1C579B";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [registerDeviceId, setRegisterDeviceId] = useState('');
  const [ownedDevices, setOwnedDevices] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState({});
  const [error, setError] = useState('');
  const [contractError, setContractError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          await web3Provider.send("eth_requestAccounts", []);
          const signer = web3Provider.getSigner();
          const account = await signer.getAddress();

          setProvider(web3Provider);
          setSigner(signer);
          setAccount(account);

          // Fetch token balance
          const tokenContract = new ethers.Contract(tokenAddress, tokenABI, web3Provider);
          const balance = await tokenContract.balanceOf(account);
          setTokenBalance(ethers.utils.formatUnits(balance, 18)); // Assuming token has 18 decimals
        } else {
          setError('MetaMask not detected. Please install MetaMask and refresh the page.');
        }
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
        setError('Failed to connect to MetaMask. Please ensure MetaMask is installed and try again.');
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchOwnedDevices = async () => {
      try {
        const deviceBindingContract = new ethers.Contract(deviceBindingAddress, deviceBindingABI, signer);
        const ownedDevices = await deviceBindingContract.getOwnedDevices(account);
        setOwnedDevices(ownedDevices);

        const devicesRegistryContract = new ethers.Contract(registryAddress, registryABI, signer);

        const deviceStatuses = await Promise.all(ownedDevices.map(async (deviceId) => {
          const deviceDetails = await devicesRegistryContract.devices(deviceId);
          const isRegistered = deviceDetails.isRegistered;
          const isActive = deviceDetails.isActive;
          return { deviceId, isRegistered, isActive };
        }));

        setDeviceStatuses(deviceStatuses.reduce((acc, status) => ({ ...acc, [status.deviceId]: status }), {}));
      } catch (error) {
        console.error('Error fetching owned devices and statuses:', error);
      }
    };

    if (signer) {
      fetchOwnedDevices();
    }
  }, [signer, account]);

  const handleUnbindDevice = async (deviceId) => {
    try {
      const bindingContract = new ethers.Contract(deviceBindingAddress, deviceBindingABI, signer);
      const tx = await bindingContract.unbindDevice(deviceId);
      await tx.wait();
      console.log(`Device ${deviceId} successfully unbound.`);
      // Update the device list and statuses
      setOwnedDevices((prevDevices) => prevDevices.filter((id) => id !== deviceId));
      setDeviceStatuses((prevStatuses) => {
        const newStatuses = { ...prevStatuses };
        delete newStatuses[deviceId];
        return newStatuses;
      });
    } catch (error) {
      console.error('Error unbinding device:', error);
      setError('Failed to unbind device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };
  
  const handleSuspendDevice = async (deviceId) => {
    try {
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await registryContract.suspendDevice(deviceId);
      await tx.wait();
      console.log(`Device ${deviceId} suspended successfully.`);
      setDeviceStatuses((prevStatuses) => ({
        ...prevStatuses,
        [deviceId]: { ...prevStatuses[deviceId], isActive: false }
      }));
    } catch (error) {
      console.error('Error suspending device:', error);
      setError('Failed to suspend device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };
  
  const handleActivateDevice = async (deviceId) => {
    try {
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await registryContract.activateDevice(deviceId);
      await tx.wait();
      console.log(`Device ${deviceId} activated successfully.`);
      setDeviceStatuses((prevStatuses) => ({
        ...prevStatuses,
        [deviceId]: { ...prevStatuses[deviceId], isActive: true }
      }));
    } catch (error) {
      console.error('Error activating device:', error);
      setError('Failed to activate device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };
  
  const handleBindDevice = async () => {
    try {
      const contract = new ethers.Contract(deviceBindingAddress, deviceBindingABI, signer);
      const tx = await contract.bindDevice(newDeviceId, account);
      await tx.wait();
      console.log(`Device ${newDeviceId} bound to ${account} successfully.`);
      // Update the device list and statuses
      setOwnedDevices((prevDevices) => [...prevDevices, newDeviceId]);
      const isRegistered = await contract.isRegistered(newDeviceId);
      const isActive = await contract.isActive(newDeviceId);
      setDeviceStatuses((prevStatuses) => ({
        ...prevStatuses,
        [newDeviceId]: { deviceId: newDeviceId, isRegistered, isActive }
      }));
      setNewDeviceId('');
    } catch (error) {
      console.error('Error binding device:', error);
      setError('Failed to bind device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };
  
  const handleRegisterDevice = async () => {
    try {
      const contract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await contract.registerDevice(registerDeviceId);
      await tx.wait();
      console.log(`Device ${registerDeviceId} registered successfully.`);
      setRegisterDeviceId('');
    } catch (error) {
      console.error('Error registering device:', error);
      setError('Failed to register device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };
  
  const handleRemoveDevice = async (deviceId) => {
    try {
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await registryContract.removeDevice(deviceId);
      await tx.wait();
      console.log(`Device ${deviceId} removed successfully.`);
      // Update the device list and statuses
      setOwnedDevices((prevDevices) => prevDevices.filter((id) => id !== deviceId));
      setDeviceStatuses((prevStatuses) => {
        const newStatuses = { ...prevStatuses };
        delete newStatuses[deviceId];
        return newStatuses;
      });
    } catch (error) {
      console.error('Error removing device:', error);
      setError('Failed to remove device. Please try again.');
      const errorMessage = error?.error?.data?.message || error.message;
      setContractError(errorMessage);
    }
  };

  return (
    <div>
      <h1>MetaMask & Hardhat Integration</h1>
      {account ? (
        <div>
          <p>Connected Account: {account}</p>
          <p>Token Balance: {tokenBalance} TOC</p>
          {ownedDevices.length > 0 && (
            <div>
              <p>Devices owned by {account}:</p>
              <ul>
                {ownedDevices.map((deviceId, index) => (
                  <li key={index}>
                    <p>Device ID: {deviceId}</p>
                    <p>
                      Is Registered: {deviceStatuses[deviceId]?.isRegistered ? 'Yes' : 'No'}
                      <button onClick={() => handleUnbindDevice(deviceId)}>Unbind</button>
                    </p>
                    <p>
                      Is Active: {deviceStatuses[deviceId]?.isActive ? 'Yes' : 'No'}
                      {deviceStatuses[deviceId]?.isActive ? (
                        <button onClick={() => handleSuspendDevice(deviceId)}>Suspend</button>
                      ) : (
                        <button onClick={() => handleActivateDevice(deviceId)}>Activate</button>
                      )}
                    </p>
                    <button onClick={() => handleRemoveDevice(deviceId)}>Remove (Admin Feature)</button> {/* Admin Feature */}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <input
              type="text"
              placeholder="Enter Device ID"
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
            />
            <button onClick={handleBindDevice}>
              Bind Device
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter Device ID to Register"
              value={registerDeviceId}
              onChange={(e) => setRegisterDeviceId(e.target.value)}
            />
            <button onClick={handleRegisterDevice}>
              Register Device (Admin Feature)
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>Please connect to MetaMask.</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
      {contractError && <p style={{ color: 'red' }}>Smart Contract Error: {contractError}</p>}
    </div>
  );
}

export default App;