task("bind-device", "Bind a device to a user")
    .addParam("deviceid", "Id of the device")
    .addParam("userid", "Id of the user")
    .addParam("authcode", "Authentication code for the device")
    .setAction(async (taskArgs, hre) => {
        const { deviceid, userid, authcode } = taskArgs;
        const { deployments, ethers } = hre;
        const [deployer] = await ethers.getSigners();

        const DevicesRegistry = await deployments.get("DevicesRegistry");
        const deviceRegistry = await ethers.getContractAt(
            "DevicesRegistry",
            DevicesRegistry.address,
            deployer
        );

        const formattedAuthCode = ethers.utils.formatBytes32String(authcode);

        const tx = await deviceRegistry.bindDevice(deviceid, formattedAuthCode, userid);
        await tx.wait();

        console.log(`Device ${deviceid} binded to user ${userid} with auth code ${formattedAuthCode}`);
    });
