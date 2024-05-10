task("check-decimals", "Checks the decimal value of the token")
.setAction(async (_, { ethers }) => {
  const tokenAddress = "0x911c3A704c6b5954Aa4d698fb41C77D06d1C579B";
  const TokenArtifact = require("../artifacts/contracts/Token.sol/Token.json");
  const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, ethers.provider);
  
  const decimals = await token.decimals();
  console.log(`Token Decimals: ${decimals}`);
});
