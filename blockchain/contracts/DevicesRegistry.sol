// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DevicesRegistry is Ownable {
    using Counters for Counters.Counter;

    event DeviceRegistered(bytes32 indexed _deviceId);
    event DeviceDeleted(bytes32 indexed _deviceId);
    event DeviceSuspended(bytes32 indexed _deviceId);
    event DeviceActivated(bytes32 indexed _deviceId);
    event OwnershipAssigned(bytes32 indexed _deviceId, address indexed _ownerAddress);
    event OwnershipRenounced(bytes32 indexed _deviceId);

    struct Device {
        bool isRegistered;
        bool isActive;
    }

    mapping(bytes32 => Device) public devices;
    mapping(bytes32 => address) public deviceToOwner;
    mapping(address => bytes32[]) public ownerToDevices;
    mapping(bytes32 => bytes32) private authTokens;
    bytes32[] public allDeviceIds;
    Counters.Counter private totalDevices;

    modifier onlyRegisteredDevice(bytes32 _deviceId) {
        require(devices[_deviceId].isRegistered, "Data Source is not registered");
        _;
    }

    modifier onlyUnregisteredDevice(bytes32 _deviceId) {
        require(!devices[_deviceId].isRegistered, "Data Source already registered");
        _;
    }

    modifier onlyActiveDevice(bytes32 _deviceId) {
        require(devices[_deviceId].isActive, "Data Source is suspended");
        _;
    }

    modifier onlySuspendedDevice(bytes32 _deviceId) {
        require(!devices[_deviceId].isActive, "Data Source is active");
        _;
    }

    modifier onlyAuthorizedDevice(bytes32 _deviceId) {
        require(devices[_deviceId].isRegistered, "device is not registered");
        _;
    }

    modifier onlyNotBoundDevice(bytes32 _deviceId) {
        require(deviceToOwner[_deviceId] == address(0), "device has already been bound");
        _;
    }

    modifier onlyBoundDevice(bytes32 _deviceId) {
        require(deviceToOwner[_deviceId] != address(0), "device is not bound");
        _;
    }

    modifier onlyDeviceOwnerOrAdmin(bytes32 _deviceId) {
        require((deviceToOwner[_deviceId] == msg.sender) || (msg.sender == owner()), "not the device owner or admin");
        _;
    }

    modifier onlyAvailableForBinding(bytes32 _deviceId) {
        require(
            deviceToOwner[_deviceId] == address(0) &&
            devices[_deviceId].isRegistered && 
            !devices[_deviceId].isActive,
            "device is already bound or not available for binding"
        );
        _;
    }

    constructor() {}

    function registerDevice(bytes32 _deviceId, bytes32 authCode) public onlyOwner onlyUnregisteredDevice(_deviceId) {
        require(authCode != bytes32(0), "Invalid authentication code");
        authTokens[_deviceId] = authCode;
        devices[_deviceId] = Device(true, false);
        allDeviceIds.push(_deviceId);
        totalDevices.increment();
        emit DeviceRegistered(_deviceId);
    }

    function removeDevice(bytes32 _deviceId) public onlyOwner onlyRegisteredDevice(_deviceId) onlyNotBoundDevice(_deviceId) {
        delete devices[_deviceId];
        totalDevices.decrement();
        emit DeviceDeleted(_deviceId);
    }

    function suspendDevice(bytes32 _deviceId) public onlyDeviceOwnerOrAdmin(_deviceId) onlyRegisteredDevice(_deviceId) onlyActiveDevice(_deviceId) {
        devices[_deviceId].isActive = false;
        emit DeviceSuspended(_deviceId);
    }

    function activateDevice(bytes32 _deviceId) public onlyDeviceOwnerOrAdmin(_deviceId) onlyRegisteredDevice(_deviceId) onlySuspendedDevice(_deviceId) {
        devices[_deviceId].isActive = true;
        emit DeviceActivated(_deviceId);
    }

    function bindDevice(bytes32 _deviceId, bytes32 authCode, address _ownerAddress) public onlyAuthorizedDevice(_deviceId) onlyNotBoundDevice(_deviceId) onlyAvailableForBinding(_deviceId) returns (bool) {
        if (msg.sender != owner()) {
            require(_ownerAddress == msg.sender, "Normal users can only bind the device to themselves");
        }
        require(
            authTokens[_deviceId] == authCode,
            "Invalid authentication code"
        );
        _bindDevice(_deviceId, _ownerAddress);
        emit OwnershipAssigned(_deviceId, _ownerAddress);
        return true;
    }

    function unbindDevice(bytes32 _deviceId) public onlyBoundDevice(_deviceId) onlyDeviceOwnerOrAdmin(_deviceId) onlySuspendedDevice(_deviceId) returns (bool) {
        _unbindDevice(_deviceId);
        emit OwnershipRenounced(_deviceId);
        return true;
    }

    function getDevicesCount() public view returns (uint) {
        return totalDevices.current();
    }

    function getDeviceOwner(bytes32 _deviceId) public view returns (address) {
        return deviceToOwner[_deviceId];
    }

    function getOwnedDevices(address _ownerAddress) public view returns (bytes32[] memory) {
        return ownerToDevices[_ownerAddress];
    }

    function _bindDevice(bytes32 _deviceId, address _ownerAddress) private {
        deviceToOwner[_deviceId] = _ownerAddress;
        ownerToDevices[_ownerAddress].push(_deviceId);
    }

    function _unbindDevice(bytes32 _deviceId) private {
        address ownerAddress = deviceToOwner[_deviceId];
        delete deviceToOwner[_deviceId];
        _removeDeviceFromOwner(ownerAddress, _deviceId);
    }

    function _removeDeviceFromOwner(address _ownerAddress, bytes32 _deviceId) private {
        bytes32[] storage ownedDevices = ownerToDevices[_ownerAddress];
        uint deviceIndex;
        for (uint i = 0; i < ownedDevices.length; i++) {
            if (ownedDevices[i] == _deviceId) {
                deviceIndex = i;
                break;
            }
        }
        ownedDevices[deviceIndex] = ownedDevices[ownedDevices.length - 1];
        ownedDevices.pop();
    }

    function isAuthorizedDevice(bytes32 _deviceId) public view onlyRegisteredDevice(_deviceId) onlyActiveDevice(_deviceId) returns (bool) {
        return true;
    }

    function isRegistered(bytes32 _deviceId) public view returns (bool) {
        return devices[_deviceId].isRegistered;
    }

    function isActive(bytes32 _deviceId) public view returns (bool) {
        return devices[_deviceId].isActive;
    }
}
