task("remove-erc20-minter", "Revoke erc20 token minter role from an address")
  .addParam("address", "Address to revoke minter role from")
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