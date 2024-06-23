const { expect } = require("chai");
const hre = require("hardhat");

let devicesRegistry;
let owner, user, badGuy, user_2;

const DEVICE_ID_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
const DEVICE_ID_2 = "0x1234567890123456789012345678901234567890123456789012345678901235";
const DEVICE_ID_3 = "0x1234567890123456789012345678901234567890123456789012345678901236";
const ZERO_ADDR = hre.ethers.constants.AddressZero;
const AUTH_TOKEN_1 = ethers.utils.formatBytes32String("token1234567890");
const AUTH_TOKEN_2 = ethers.utils.formatBytes32String("token0987654321");
const AUTH_TOKEN_3 = ethers.utils.formatBytes32String("token1122334455");

describe("DevicesRegistry", function () {
  before(async function () {
    [owner, user, badGuy, user_2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const DevicesRegistry = await hre.ethers.getContractFactory("DevicesRegistry");
    devicesRegistry = await DevicesRegistry.deploy();
    await devicesRegistry.deployed();
  });

  describe("Initialization", function () {
    it("Should deploy DevicesRegistry", async function () {
      expect(devicesRegistry.address).to.not.equal(0);
    });
  });

  describe("Binding", function () {
    it("Should bind a device", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(1);
      expect(await devicesRegistry.getOwnedDevices(user.address)).to.eql([DEVICE_ID_1]);
    });

    it("Should bind multiple devices", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.registerDevice(DEVICE_ID_2, AUTH_TOKEN_2);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      await devicesRegistry.bindDevice(DEVICE_ID_2, AUTH_TOKEN_2, user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_2)).to.equal(user.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(2);
      expect(await devicesRegistry.getOwnedDevices(user.address)).to.eql([DEVICE_ID_1, DEVICE_ID_2]);
    });

    it("Should bind multiple devices to multiple users", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.registerDevice(DEVICE_ID_2, AUTH_TOKEN_2);
      await devicesRegistry.registerDevice(DEVICE_ID_3, AUTH_TOKEN_3);

      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      await devicesRegistry.bindDevice(DEVICE_ID_2, AUTH_TOKEN_2, user_2.address);
      await devicesRegistry.bindDevice(DEVICE_ID_3, AUTH_TOKEN_3, user.address);

      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_2)).to.equal(user_2.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_3)).to.equal(user.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(3);
      expect(await devicesRegistry.getOwnedDevices(user.address)).to.eql([DEVICE_ID_1, DEVICE_ID_3]);
      expect(await devicesRegistry.getOwnedDevices(user_2.address)).to.eql([DEVICE_ID_2]);
    });

    it("Should emit an event when binding a device", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await expect(devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address))
        .to.emit(devicesRegistry, "OwnershipAssigned")
        .withArgs(DEVICE_ID_1, user.address);
    });

    it("Should not bind a device if it is already bound", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      await expect(devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address)).to.be.revertedWith("device has already been bound");
    });

    it("Should not bind a device if it is not authorized", async function () {
      await expect(devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address)).to.be.revertedWith("device is not registered");
    });

    it("Should bind a device that is registered, not active, and has no owner", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(1);
    });

    it("User can bind the device if isRegistered is true, isActive is false, and address is 0x00", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(user.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(1);
    });

    it("Admin (owner of smart contract) can bind the device whenever", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.connect(owner).bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, owner.address);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(owner.address);
      expect(await devicesRegistry.getDevicesCount()).to.equal(1);
    });

    it("User cannot bind the device if it is active", async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.activateDevice(DEVICE_ID_1);
      await expect(devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address)).to.be.revertedWith("device is already bound or not available for binding");
    });
  });

  describe("Unbinding", function () {
    beforeEach(async function () {
      await devicesRegistry.registerDevice(DEVICE_ID_1, AUTH_TOKEN_1);
      await devicesRegistry.registerDevice(DEVICE_ID_2, AUTH_TOKEN_2);
      await devicesRegistry.bindDevice(DEVICE_ID_1, AUTH_TOKEN_1, user.address);
      await devicesRegistry.activateDevice(DEVICE_ID_1);
    });

    it("Should unbind a device", async function () {
      await devicesRegistry.suspendDevice(DEVICE_ID_1);
      await devicesRegistry.unbindDevice(DEVICE_ID_1);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
      expect(await devicesRegistry.getOwnedDevices(user.address)).to.eql([]);
    });

    it("Should unbind multiple devices", async function () {
      // Bind DEVICE_ID_2 to user
      await devicesRegistry.bindDevice(DEVICE_ID_2, AUTH_TOKEN_2, user.address);

      // Suspend DEVICE_ID_1
      await devicesRegistry.suspendDevice(DEVICE_ID_1);
  
      // Unbind both devices
      await devicesRegistry.unbindDevice(DEVICE_ID_1);
      await devicesRegistry.unbindDevice(DEVICE_ID_2);
  
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_1)).to.equal(ZERO_ADDR);
      expect(await devicesRegistry.getDeviceOwner(DEVICE_ID_2)).to.equal(ZERO_ADDR);
    });

    it("Should emit an event when unbinding a device", async function () {
      await devicesRegistry.suspendDevice(DEVICE_ID_1);
      await expect(devicesRegistry.unbindDevice(DEVICE_ID_1))
        .to.emit(devicesRegistry, "OwnershipRenounced")
        .withArgs(DEVICE_ID_1);
    });

    it("Should not unbind a device if it is not bound", async function () {
      await expect(devicesRegistry.unbindDevice(DEVICE_ID_2)).to.be.revertedWith("device is not bound");
    });

    it("Should not unbind a device if it is not suspended", async function () {
      await expect(devicesRegistry.unbindDevice(DEVICE_ID_1)).to.be.revertedWith("Data Source is active");
    });

    it("Should not unbind a device if it is already unbound", async function () {
      await devicesRegistry.suspendDevice(DEVICE_ID_1);
      await devicesRegistry.unbindDevice(DEVICE_ID_1);
      await expect(devicesRegistry.unbindDevice(DEVICE_ID_1)).to.be.revertedWith("device is not bound");
    });

    it("Should not unbind a device if it is not owned by the sender", async function () {
      await devicesRegistry.suspendDevice(DEVICE_ID_1);
      await expect(devicesRegistry.connect(badGuy).unbindDevice(DEVICE_ID_1)).to.be.revertedWith("not the device owner or admin");
    });
  });
});
