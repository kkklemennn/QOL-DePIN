task("get-device-owner", "Gets the owner of a given device")
    .addParam("deviceid", "Id of the device")
    .setAction(async (taskArgs, hre) => {
        const { deviceid, userid } = taskArgs;
        const { deployments } = hre;
        const [deployer] = await ethers.getSigners();

        const DeviceBinding = await deployments.get("DeviceBinding");
        const deviceBinding = await ethers.getContractAt(
            "DeviceBinding",
            DeviceBinding.address,
            deployer
        );

    const ownerAddress = await deviceBinding.deviceToOwner(deviceid);
    console.log(`Owner of device ${deviceid} is: ${ownerAddress}`);
  });