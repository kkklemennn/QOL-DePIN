task("device-status", "Outputs the details of a device from the devices mapping")
  .addParam("deviceid", "The ID of the device to query")
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

    const deviceDetails = await deviceRegistry.devices(deviceid);
    console.log(`Device ID: ${deviceid}`);
    console.log(`Is Registered: ${deviceDetails.isRegistered}`);
    console.log(`Is Active: ${deviceDetails.isActive}`);
  });