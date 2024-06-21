task("get-device-owner", "Gets the owner of a given device")
    .addParam("deviceid", "Id of the device")
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

    const ownerAddress = await deviceRegistry.deviceToOwner(deviceid);
    console.log(`Owner of device ${deviceid} is: ${ownerAddress}`);
  });