task("remove-device", "Removes a registered device")
  .addParam("deviceid", "The ID of the device to remove")
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

    const tx = await deviceRegistry.removeDevice(deviceid);
    await tx.wait();

    console.log(`Device ${deviceid} removed successfully.`);
  });

  // TODO - MAYBE REMOVE IT ALSO FROM THE DEVICE BINDING.