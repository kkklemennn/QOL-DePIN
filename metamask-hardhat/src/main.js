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
  newDeviceId,
  bindAuthToken,
  registerDeviceId,
  authToken,
  unbindDeviceId,
  removeDeviceId,
  setNewDeviceId,
  setBindAuthToken,
  setRegisterDeviceId,
  setAuthToken,
  setUnbindDeviceId,
  setRemoveDeviceId,
  error,
  contractError,
}) => (
  <div className="container">
    {account ? (
      <div>
        <p>Connected Account: <strong>{account}</strong></p>
        <p>Token Balance: <strong>{tokenBalance} TOC</strong></p>
        {ownedDevices.length > 0 && (
          <div>
            <p>Your devices:</p>
            <ul className="list-group">
              {ownedDevices.map((deviceId, index) => (
                <li key={index} className="list-group-item">
                  <p>Device ID: {deviceId}</p>
                  <p>
                    Is Registered: {deviceStatuses[deviceId]?.isRegistered ? 'Yes' : 'No'}
                    <button className="btn btn-sm btn-danger ml-2" onClick={() => handleUnbindDevice(deviceId)}>Unbind</button>
                  </p>
                  <p>
                    Is Active: {deviceStatuses[deviceId]?.isActive ? 'Yes' : 'No'}
                    {deviceStatuses[deviceId]?.isActive ? (
                      <button className="btn btn-sm btn-warning ml-2" onClick={() => handleSuspendDevice(deviceId)}>Suspend</button>
                    ) : (
                      <button className="btn btn-sm btn-success ml-2" onClick={() => handleActivateDevice(deviceId)}>Activate</button>
                    )}
                  </p>
                  {account === adminAddress && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleRemoveDevice(deviceId)}>Remove (Admin Feature)</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="form-group border p-3 mt-4">
          <h3>Bind New Device</h3>
          <div className="row">
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Device ID"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
              />
            </div>
            <div className="col-4">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Auth Token"
                value={bindAuthToken}
                onChange={(e) => setBindAuthToken(e.target.value)}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 text-right">
              <button className="btn btn-primary" onClick={handleBindDevice}>
                Bind Device
              </button>
            </div>
          </div>
        </div>
        {account === adminAddress && (
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Device ID to Register"
              value={registerDeviceId}
              onChange={(e) => setRegisterDeviceId(e.target.value)}
            />
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Enter Auth Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={handleRegisterDevice}>
              Register Device (Admin Feature)
            </button>
          </div>
        )}
        {account === adminAddress && (
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Device ID to Unbind"
              value={unbindDeviceId}
              onChange={(e) => setUnbindDeviceId(e.target.value)}
            />
            <button className="btn btn-danger mt-2" onClick={handleAdminUnbindDevice}>
              Unbind Device (Admin Feature)
            </button>
          </div>
        )}
        {account === adminAddress && (
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Device ID to Remove"
              value={removeDeviceId}
              onChange={(e) => setRemoveDeviceId(e.target.value)}
            />
            <button className="btn btn-danger mt-2" onClick={() => handleRemoveDevice(removeDeviceId)}>
              Remove Device (Admin Feature)
            </button>
          </div>
        )}
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
