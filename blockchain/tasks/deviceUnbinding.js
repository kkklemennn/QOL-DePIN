task("unbind-device", "Unbinds a device from its owner")
    .addParam("deviceid", "Id of the device")
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

        console.log(`Unbinding device with ID: ${deviceid}`);


    const tx = await deviceRegistry.unbindDevice(deviceid);
    await tx.wait();

    console.log(`Device ${deviceid} successfully unbound.`);
    });