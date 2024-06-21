task("get-owner-devices", "Gets all devices owned by a given address")
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

    const devices = await deviceRegistry.getOwnedDevices(userid);
    console.log(`Devices owned by ${userid}:`, devices.join(", "));
  });