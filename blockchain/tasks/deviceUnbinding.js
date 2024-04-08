task("unbind-device", "Unbinds a device from its owner")
    .addParam("deviceid", "Id of the device")
    .setAction(async (taskArgs, hre) => {
        const { deviceid } = taskArgs;
        const { deployments } = hre;
        const [deployer] = await ethers.getSigners();

        const DeviceBinding = await deployments.get("DeviceBinding");
        const deviceBinding = await ethers.getContractAt(
            "DeviceBinding",
            DeviceBinding.address,
            deployer
        );

        console.log(`Unbinding device with ID: ${deviceid}`);


    const tx = await deviceBinding.unbindDevice(deviceid);
    await tx.wait();

    console.log(`Device ${deviceid} successfully unbound.`);
    });