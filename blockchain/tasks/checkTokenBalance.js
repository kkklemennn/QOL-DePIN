task("check-balance", "Checks the token balance of an address")
  .addParam("address", "The address to check the balance for")
  .setAction(async (taskArgs, { ethers }) => {
    const tokenAddress = "0x911c3A704c6b5954Aa4d698fb41C77D06d1C579B";  // Your token's contract address
    const TokenArtifact = require("../artifacts/contracts/Token.sol/Token.json");  // Adjust path as needed
    const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, ethers.provider);
    
    const balance = await token.balanceOf(taskArgs.address);
    console.log(`Balance of ${taskArgs.address} is: ${balance.toString()} wei-tokens`);
  });
