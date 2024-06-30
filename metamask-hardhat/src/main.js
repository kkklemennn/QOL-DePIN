import React from 'react';

const Main = ({
  account,
  adminAddress,
  tokenBalance,
  ownedDevices,
  deviceStatuses,
  handleUnbindDevice,
  handleSuspendDevice,
  handleActivateDevice,
  handleRemoveDevice,
  handleBindDevice,
  handleRegisterDevice,
  handleAdminUnbindDevice,
  handleVerify,
  newDeviceId,
  bindAuthToken,
  registerDeviceId,
  authToken,
  unbindDeviceId,
  removeDeviceId,
  message,
  signature,
  setNewDeviceId,
  setBindAuthToken,
  setRegisterDeviceId,
  setAuthToken,
  setUnbindDeviceId,
  setRemoveDeviceId,
  setMessage,
  setSignature,
  verificationResult,
  error,
  contractError,
}) => (
  <div>
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

export default Main;
