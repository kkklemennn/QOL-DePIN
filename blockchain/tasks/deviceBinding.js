task("bind-device", "Bind a device to a user")
    .addParam("deviceid", "Id of the device")
    .addParam("userid", "Id of the user")
    .setAction(async (taskArgs, hre) => {
        const { deviceid, userid } = taskArgs;
        const { deployments } = hre;
        const [deployer] = await ethers.getSigners();

        const DevicesRegistry = await deployments.get("DevicesRegistry");
        const deviceRegistry = await ethers.getContractAt(
          "DevicesRegistry",
          DevicesRegistry.address,
          deployer
        );

        const tx = await deviceRegistry.bindDevice(deviceid, userid);
        await tx.wait();

        console.log(`Device ${deviceid} binded to user ${userid}`);
    });

    // suspend is admin
    // unbind is not admin
    // bind is admin or - because owner is 0x000...0 address