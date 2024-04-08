task("get-owner-devices", "Gets all devices owned by a given address")
    .addParam("userid", "Id of the user")
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

    const devices = await deviceBinding.getOwnedDevices(userid);
    console.log(`Devices owned by ${userid}:`, devices.join(", "));
  });