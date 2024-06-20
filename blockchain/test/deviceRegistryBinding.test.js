const { expect } = require("chai");
const hre = require("hardhat");

describe("DevicesRegistry", function () {
  let devicesRegistry;
  let owner, user, badGuy, user_2;

  const DEVICE_ID_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const ZERO_ADDR = hre.ethers.constants.AddressZero;

  before(async function () {
    [owner, user, badGuy, user_2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const DevicesRegistry = await hre.ethers.getContractFactory("DevicesRegistry");
    devicesRegistry = await DevicesRegistry.deploy();
    await devicesRegistry.deployed();
  });

  it("Should have correct initial states after device is registered", async function () {
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(await devicesRegistry.isRegistered(DEVICE_ID_1)).to.be.true;
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.false;
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
  });

  it("Admin registers a device, user binds and activates it", async function () {
    // Admin registers a device
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    let device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;

    // User1 binds the device
    await devicesRegistry.connect(user).bindDevice(DEVICE_ID_1, user.address);
    let ownerAddress = await devicesRegistry.getDeviceOwner(DEVICE_ID_1);
    // console.log("Device Owner after binding:", ownerAddress);
    expect(ownerAddress).to.equal(user.address);
    
    // Verify through DevicesRegistry that the owner is updated
    device = await devicesRegistry.devices(DEVICE_ID_1);
    // console.log("Device State after binding:", device);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;  // Still suspended

    // User1 activates the device
    await devicesRegistry.connect(user).activateDevice(DEVICE_ID_1);
    device = await devicesRegistry.devices(DEVICE_ID_1);
    // console.log("Device State after activation:", device);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.true;
  });

  it("Admin registers a device, user1 binds and activates it, admin suspends and unbinds it, then user2 binds it", async function () {
    // Admin registers a new device
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    let device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;

    // User1 binds the device
    await devicesRegistry.connect(user).bindDevice(DEVICE_ID_1, user.address);
    let ownerAddress = await devicesRegistry.getDeviceOwner(DEVICE_ID_1);
    expect(ownerAddress).to.equal(user.address);
    
    // Verify through DevicesRegistry that the owner is updated
    device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;  // Still suspended

    // User1 activates the device
    await devicesRegistry.connect(user).activateDevice(DEVICE_ID_1);
    device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.true;

    // Admin suspends and unbinds the device
    await devicesRegistry.connect(owner).suspendDevice(DEVICE_ID_1);
    await devicesRegistry.connect(owner).unbindDevice(DEVICE_ID_1);
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);

    // User2 binds the device
    await devicesRegistry.connect(user_2).bindDevice(DEVICE_ID_1, user_2.address);
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user_2.address);
  });

  it("Admin registers a device, user1 binds and activates it, admin suspends and unbinds it, admin binds it to user2 and user2 unbinds it", async function () {
    // Admin registers a new device
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    let device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;

    // User1 binds the device
    await devicesRegistry.connect(user).bindDevice(DEVICE_ID_1, user.address);
    let ownerAddress = await devicesRegistry.getDeviceOwner(DEVICE_ID_1);
    expect(ownerAddress).to.equal(user.address);

    // User1 activates the device
    await devicesRegistry.connect(user).activateDevice(DEVICE_ID_1);
    device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.true;
    
    // Admin suspends and unbinds the device
    await devicesRegistry.connect(owner).suspendDevice(DEVICE_ID_1);
    await devicesRegistry.connect(owner).unbindDevice(DEVICE_ID_1);
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
    
    // Admin binds the device to user2
    await devicesRegistry.connect(owner).bindDevice(DEVICE_ID_1, user_2.address);
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user_2.address);
    
    // console.log("owner of device", await devicesRegistry.getDeviceOwner(DEVICE_ID_1));
    // console.log ("admin", owner.address);
    // console.log ("devowner", user_2.address);
    // console.log("Device State after:", await devicesRegistry.devices(DEVICE_ID_1));
    
    // User2 activates and then suspends the device
    await devicesRegistry.connect(user_2).activateDevice(DEVICE_ID_1);
    expect(device.isActive).to.be.true;
    await devicesRegistry.connect(user_2).suspendDevice(DEVICE_ID_1);
    device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isActive).to.be.false;

    // User2 unbinds the device
    await devicesRegistry.connect(user_2).unbindDevice(DEVICE_ID_1);
    expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
  });

  it("Admin creates a device, user1 tries to bind it to user2 (should revert)", async function () {
    // Admin registers a new device
    await devicesRegistry.connect(owner).registerDevice(DEVICE_ID_1);
    let device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;

    // User1 tries to bind the device to user2, which should fail
    await expect(devicesRegistry.connect(user).bindDevice(DEVICE_ID_1, user_2.address))
        .to.be.revertedWith("Normal users can only bind the device to themselves");

    // Ensure the device is still unbound
    let ownerAddress = await devicesRegistry.getDeviceOwner(DEVICE_ID_1);
    expect(ownerAddress).to.equal(ZERO_ADDR);
  });
});
