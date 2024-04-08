task("activate-device", "Activates a suspended device")
  .addParam("deviceid", "The ID of the device to activate")
  .setAction(async (taskArgs, hre) => {
    const { deviceid } = taskArgs;
    const { deployments } = hre;
    const [deployer] = await ethers.getSigners();

    const DevicesRegistry = await deployments.get("DevicesRegistry");
    const deviceRegistry = await ethers.getContractAt(
      "DevicesRegistry",
      DevicesRegistry.address,
      deployer
    );
    
    const tx = await deviceRegistry.activateDevice(deviceid);
    await tx.wait();

    console.log(`Device ${deviceid} activated successfully.`);
  });