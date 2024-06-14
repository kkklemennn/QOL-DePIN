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


    // suspend is admin
    // unbind is not admin
    // bind is admin or - because owner is 0x000...0 address
   
   
    // change to set is active to false

//     task("unbind-device", "Unbinds a device from its owner and suspends the device")
//   .addParam("deviceid", "Id of the device")
//   .setAction(async (taskArgs, hre) => {
//     const { deviceid } = taskArgs;
//     const { deployments } = hre;
//     const [deployer] = await ethers.getSigners();

//     const DeviceBinding = await deployments.get("DeviceBinding");
//     const deviceBinding = await ethers.getContractAt(
//       "DeviceBinding",
//       DeviceBinding.address,
//       deployer
//     );

//     const DevicesRegistry = await deployments.get("DevicesRegistry");
//     const devicesRegistry = await ethers.getContractAt(
//       "DevicesRegistry",
//       DevicesRegistry.address,
//       deployer
//     );

//     console.log(`Unbinding device with ID: ${deviceid}`);

//     const unbindTx = await deviceBinding.unbindDevice(deviceid);
//     await unbindTx.wait();

//     console.log(`Device ${deviceid} successfully unbound.`);

//     console.log(`Suspending device ${deviceid}`);
//     const suspendTx = await devicesRegistry.suspendDevice(deviceid);
//     await suspendTx.wait();

//     console.log(`Device ${deviceid} suspended successfully.`);
//   });
