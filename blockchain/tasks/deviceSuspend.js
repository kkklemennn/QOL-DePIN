task("suspend-device", "Suspends a registered device")
  .addParam("deviceid", "The ID of the device to suspend")
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
    
    const tx = await deviceRegistry.suspendDevice(deviceid);
    await tx.wait();

    console.log(`Device ${deviceid} suspended successfully.`);
  });

    // suspend is admin
    // unbind is not admin
    // bind is admin or - because owner is 0x000...0 address