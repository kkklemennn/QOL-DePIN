task("check-minter-role", "Checks if an address has the minter role")
  .addParam("address", "The address to check for the minter role")
  .setAction(async (taskArgs, hre) => {
    const { address } = taskArgs;
    const { deployments, ethers } = hre;
    const [deployer] = await ethers.getSigners();

    const Token = await deployments.get("Token");
    const token = await ethers.getContractAt("Token", Token.address, deployer);

    const minterRole = await token.MINTER_ROLE();
    const hasMinterRole = await token.hasRole(minterRole, address);

    if (hasMinterRole) {
      console.log(`${address} has the minter role.`);
    } else {
      console.log(`${address} does not have the minter role.`);
    }
  });
