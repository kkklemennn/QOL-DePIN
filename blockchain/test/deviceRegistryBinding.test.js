const { expect } = require("chai");
const hre = require("hardhat");

describe("DevicesRegistry and DeviceBinding", function () {
  let devicesRegistry;
  let deviceBinding;
  let owner, user, badGuy, user_2;

  const DEVICE_ID_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const ZERO_ADDR = hre.ethers.constants.AddressZero;

  before(async function () {
    [owner, user, badGuy, user_2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy DevicesRegistry first
    const DevicesRegistry = await hre.ethers.getContractFactory("DevicesRegistry");
    devicesRegistry = await DevicesRegistry.deploy();
    await devicesRegistry.deployed();

    // Deploy DeviceBinding with the address of the deployed DevicesRegistry
    const DeviceBinding = await hre.ethers.getContractFactory("DeviceBinding");
    deviceBinding = await DeviceBinding.deploy(devicesRegistry.address);
    await deviceBinding.deployed();
  });

  it("Should have correct initial states after device is registered", async function () {
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    console.log("Device State after registration:", device);
    expect(await devicesRegistry.isRegistered(DEVICE_ID_1)).to.be.true;
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.false;
    expect(await deviceBinding.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
  });

  it("Admin registers a device, user binds and activates it", async function () {
    // Admin registers a device
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    let device = await devicesRegistry.devices(DEVICE_ID_1);
    console.log("Device State after registration:", device);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;

    // User1 binds the device
    await deviceBinding.connect(user).bindDevice(DEVICE_ID_1, user.address);
    let ownerAddress = await deviceBinding.getDeviceOwner(DEVICE_ID_1);
    console.log("Device Owner after binding:", ownerAddress);
    expect(ownerAddress).to.equal(user.address);
    
    // Verify through DevicesRegistry that the owner is updated
    device = await devicesRegistry.devices(DEVICE_ID_1);
    console.log("Device State after binding:", device);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;  // Still suspended

    // User1 activates the device
    await devicesRegistry.connect(user).activateDevice(DEVICE_ID_1, user.address);
    device = await devicesRegistry.devices(DEVICE_ID_1);
    console.log("Device State after activation:", device);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.true;
  });
});
