import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { registryABI, tokenABI } from './abis';
import axios from 'axios';

const registryAddress = "0x44a6F4B15211A8988c84916b91D9D6a4c08231f9";
const tokenAddress = "0x911c3A704c6b5954Aa4d698fb41C77D06d1C579B";
const adminAddress = "0x74a5fCa82aFE98B0C571282D5162694f3D785e35";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [registerDeviceId, setRegisterDeviceId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [bindAuthToken, setBindAuthToken] = useState('');
  const [ownedDevices, setOwnedDevices] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState({});
  const [error, setError] = useState('');
  const [contractError, setContractError] = useState('');
  const [unbindDeviceId, setUnbindDeviceId] = useState('');
  const [removeDeviceId, setRemoveDeviceId] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

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

          // Check for query parameters
          const queryParams = new URLSearchParams(window.location.search);
          const deviceid = queryParams.get('deviceid');
          const authtoken = queryParams.get('authtoken');

          if (deviceid) setNewDeviceId(deviceid);
          if (authtoken) setBindAuthToken(authtoken);

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
        const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
        const ownedDevices = await registryContract.getOwnedDevices(account);
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
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await registryContract.unbindDevice(deviceId);
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

  const handleAdminUnbindDevice = async () => {
    try {
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const tx = await registryContract.unbindDevice(unbindDeviceId);
      await tx.wait();
      console.log(`Device ${unbindDeviceId} successfully unbound by admin.`);
      setUnbindDeviceId('');
    } catch (error) {
      console.error('Error unbinding device by admin:', error);
      setError('Failed to unbind device by admin. Please try again.');
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
      const registryContract = new ethers.Contract(registryAddress, registryABI, signer);
      const formattedBindAuthToken = ethers.utils.formatBytes32String(bindAuthToken);
      const tx = await registryContract.bindDevice(newDeviceId, formattedBindAuthToken, account);
      await tx.wait();
      console.log(`Device ${newDeviceId} bound to ${account} successfully.`);
      // Update the device list and statuses
      setOwnedDevices((prevDevices) => [...prevDevices, newDeviceId]);
      const isRegistered = await registryContract.isRegistered(newDeviceId);
      const isActive = await registryContract.isActive(newDeviceId);
      setDeviceStatuses((prevStatuses) => ({
        ...prevStatuses,
        [newDeviceId]: { deviceId: newDeviceId, isRegistered, isActive }
      }));
      setNewDeviceId('');
      setBindAuthToken('');
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
      const formattedAuthToken = ethers.utils.formatBytes32String(authToken);
      const tx = await contract.registerDevice(registerDeviceId, formattedAuthToken);
      await tx.wait();
      console.log(`Device ${registerDeviceId} registered successfully.`);
      setRegisterDeviceId('');
      setAuthToken('');
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

  const handleVerify = async () => {
    try {
      const parsedMessage = JSON.parse(message);
      const response = await axios.post('http://localhost:5000/verify', {
        data: parsedMessage,
        signature
      });
      setVerificationResult(response.data.isValid ? 'Signature is valid' : 'Signature is invalid');
    } catch (error) {
      console.error('Error verifying signature:', error);
      setVerificationResult('Error verifying signature. Please check your inputs.');
    }
  };

  return (
    <div>
      <h1>MetaMask & Hardhat Integration {account === adminAddress && " - Admin Panel"}</h1>
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
                    {account === adminAddress && (
                      <button onClick={() => handleRemoveDevice(deviceId)}>Remove (Admin Feature)</button>
                    )}
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
            <input
              type="text"
              placeholder="Enter Auth Token"
              value={bindAuthToken}
              onChange={(e) => setBindAuthToken(e.target.value)}
            />
            <button onClick={handleBindDevice}>
              Bind Device
            </button>
          </div>
          {account === adminAddress && (
            <div>
              <input
                type="text"
                placeholder="Enter Device ID to Register"
                value={registerDeviceId}
                onChange={(e) => setRegisterDeviceId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter Auth Token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />
              <button onClick={handleRegisterDevice}>
                Register Device (Admin Feature)
              </button>
            </div>
          )}
          {account === adminAddress && (
            <div>
              <input
                type="text"
                placeholder="Enter Device ID to Unbind"
                value={unbindDeviceId}
                onChange={(e) => setUnbindDeviceId(e.target.value)}
              />
              <button onClick={handleAdminUnbindDevice}>
                Unbind Device (Admin Feature)
              </button>
            </div>
          )}
          {account === adminAddress && (
            <div>
              <input
                type="text"
                placeholder="Enter Device ID to Remove"
                value={removeDeviceId}
                onChange={(e) => setRemoveDeviceId(e.target.value)}
              />
              <button onClick={() => handleRemoveDevice(removeDeviceId)}>
                Remove Device (Admin Feature)
              </button>
            </div>
          )}
          <h2>Verify Signature</h2>
          <textarea
            rows="5"
            cols="50"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <br />
          <textarea
            rows="2"
            cols="50"
            placeholder="Signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
          <br />
          <button onClick={handleVerify}>Verify</button>
          <p>{verificationResult}</p>
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
