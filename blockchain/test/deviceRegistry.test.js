const { expect } = require("chai");
const { ethers } = require("hardhat");

let devicesRegistry;
let owner, user, badGuy;

const DEVICE_ID_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
const DEVICE_ID_2 = "0x1234567890123456789012345678901234567890123456789012345678901235";

describe("DevicesRegistry", function () {
  before(async function () {
    [owner, user, badGuy] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const DevicesRegistry = await ethers.getContractFactory("DevicesRegistry");
    devicesRegistry = await DevicesRegistry.deploy();
    await devicesRegistry.deployed();
  });

  it("Should deploy DevicesRegistry", async function () {
    expect(devicesRegistry.address).to.not.equal(0);
  });

  it("Should register a device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;
  });

  it("Should suspend a registered device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    await devicesRegistry.suspendDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.false;
  });

  it("Should activate a suspended device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    await devicesRegistry.suspendDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.true;
    expect(device.isActive).to.be.true;
  });

  it("Should not allow non-owner to register a device", async function () {
    await expect(devicesRegistry.connect(user).registerDevice(DEVICE_ID_2)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow non-owner to suspend a device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    await expect(devicesRegistry.connect(user).suspendDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow non-owner to activate a device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    await devicesRegistry.suspendDevice(DEVICE_ID_1);
    await expect(devicesRegistry.connect(user).activateDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should return correct registration status", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    expect(await devicesRegistry.isRegistered(DEVICE_ID_1)).to.be.true;
    expect(await devicesRegistry.isRegistered(DEVICE_ID_2)).to.be.false;
  });

  it("Should return correct activation status", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.true;
    await devicesRegistry.suspendDevice(DEVICE_ID_1);
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.false;
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.true;
  });

  it("Should not register an already registered device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await expect(devicesRegistry.registerDevice(DEVICE_ID_1)).to.be.revertedWith("Data Source already registered");
  });

  it("Should remove a registered device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await devicesRegistry.removeDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(device.isRegistered).to.be.false;
  });

  it("Should not allow non-owner to remove a device", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await expect(devicesRegistry.connect(user).removeDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  // New test cases
  it("Should have correct initial states after device is registered", async function () {
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    const device = await devicesRegistry.devices(DEVICE_ID_1);
    expect(await devicesRegistry.isRegistered(DEVICE_ID_1)).to.be.true;
    expect(await devicesRegistry.isActive(DEVICE_ID_1)).to.be.false;
  });

  it("Badguy cannot suspend, activate, register, or remove the device", async function () {
    await expect(devicesRegistry.connect(badGuy).registerDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
    await devicesRegistry.registerDevice(DEVICE_ID_1);
    await expect(devicesRegistry.connect(badGuy).suspendDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
    await devicesRegistry.activateDevice(DEVICE_ID_1);
    await devicesRegistry.suspendDevice(DEVICE_ID_1);
    await expect(devicesRegistry.connect(badGuy).activateDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(devicesRegistry.connect(badGuy).removeDevice(DEVICE_ID_1)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
