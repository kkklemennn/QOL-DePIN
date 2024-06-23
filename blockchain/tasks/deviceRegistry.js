task("register-device", "Register a device")
  .addParam("deviceid", "Id of the device")
  .addParam("authcode", "Authentication code for the device")
  .setAction(async (taskArgs, hre) => {
    const { deviceid, authcode } = taskArgs;
    const { deployments, ethers } = hre;
    const [deployer] = await ethers.getSigners();

    const DevicesRegistry = await deployments.get("DevicesRegistry");
    const deviceRegistry = await ethers.getContractAt(
      "DevicesRegistry",
      DevicesRegistry.address,
      deployer
    );

    const formattedAuthCode = ethers.utils.formatBytes32String(authcode);

    const tx = await deviceRegistry.registerDevice(deviceid, formattedAuthCode);
    await tx.wait();

    console.log(`Device ${deviceid} registered with auth code ${formattedAuthCode}`);
  });
