require("dotenv").config();
const { ethers, JsonRpcProvider } = require("ethers");
const abi = require("./abi.json");

const provider = new JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

const TO = process.env.TO_ADDRESS;
const WANT_TO_SEND = parseInt(process.env.SEND_COUNT, 10);

async function main() {
  const me = await signer.getAddress();
  const balance = await contract.balanceOf(me);
  console.log(`You own ${balance.toString()} NFTs`);

  if (Number(balance.toString()) < WANT_TO_SEND) {
    console.error(`You only have ${balance.toString()} but tried to send ${WANT_TO_SEND}`);
    process.exit(1);
  }
  let sent = 0;
  let tokenId = 1; // or 0, depending on your collection
  while (sent < WANT_TO_SEND) {
    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() === me.toLowerCase()) {
        console.log(`→ Sending tokenId ${tokenId}...`);
        const tx = await contract.transferFrom(me, TO, tokenId);
        console.log(`  tx hash: ${tx.hash}`);
        await tx.wait();
        console.log(`  ✅ tokenId ${tokenId} sent`);
        sent++;
      }else{
        console.log(`  tokenId ${tokenId} is not owned by you, skipping...`);
        tokenId++;
      }
    } catch (err) {
      // ownerOf will throw if tokenId doesn't exist yet; just skip it
    }
    
  }

  console.log(`Done! Sent ${sent} tokens to ${TO}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
