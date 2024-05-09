task("add-erc20-minter", "Grant erc20 token minter role to an address")
  .addParam("address", "Address to grant minter role to")
  .setAction(async (taskArgs, hre) => {
    const { address } = taskArgs;
    const { deployments, ethers } = hre;
    const [deployer] = await ethers.getSigners();

    try {
      const Token = await deployments.get("Token");
      const token = await ethers.getContractAt("Token", Token.address, deployer);

      const minterRole = await token.MINTER_ROLE();
      const tx = await token.revokeRole(minterRole, address);
      await tx.wait(); // Wait for the transaction to be mined

      console.log(`Minter role revoked from: ${address}`);
    } catch (error) {
      console.error(`Failed to revoke minter role from: ${address}: ${error.message}`);
    }
  });