task("hello-world", "Prints hello world").setAction(async (taskArgs, hre) => {
  console.log("Hello World!");
  const signers = await hre.ethers.getSigners();  // Get all signers
  const walletAddress = await signers[0].getAddress();  // Get address of the first signer
  console.log("Wallet Address:", walletAddress);
});
