const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const { Buffer } = require('buffer');
const { ethers } = require('ethers');
const { registryABI } = require('./abis'); // Ensure you have the ABI available here

const app = express();
const port = process.env.PORT || 5000;

const registryAddress = "0x44a6F4B15211A8988c84916b91D9D6a4c08231f9";
const provider = new ethers.providers.JsonRpcProvider('https://babel-api.testnet.iotex.io'); // Updated RPC URL

app.use(cors());
app.use(bodyParser.json());

const ec = new EC('p256');

app.get('/health', (req, res) => {
  res.send('OK');
});

app.post('/verify', (req, res) => {
  try {
    const { data, signature } = req.body;

    // Convert the data object to a JSON string
    const message = JSON.stringify(data);

    // Hash the message
    const hash = SHA256(message).toString();

    // Convert signature to appropriate format
    const signatureBytes = Buffer.from(signature, 'hex');
    const r = signatureBytes.slice(0, 32).toString('hex');
    const s = signatureBytes.slice(32, 64).toString('hex');

    // Ensure the public key is correctly formatted with '04' prefix for uncompressed format
    let formattedPublicKey = data.public_key;
    if (!formattedPublicKey.startsWith('04')) {
      formattedPublicKey = '04' + formattedPublicKey;
    }

    // Convert public key to appropriate format
    const pubKey = ec.keyFromPublic(formattedPublicKey, 'hex');

    // Verify the signature
    const isValid = pubKey.verify(hash, { r, s });

    res.json({ isValid });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(400).json({ error: 'Error verifying signature. Please check your inputs.' });
  }
});

app.get('/device-status/:deviceId', async (req, res) => {
  const { deviceId } = req.params;

  try {
    const registryContract = new ethers.Contract(registryAddress, registryABI, provider);
    const deviceDetails = await registryContract.devices(deviceId);
    const isRegistered = deviceDetails.isRegistered;
    const isActive = deviceDetails.isActive;

    res.json({ deviceId, isRegistered, isActive });
  } catch (error) {
    console.error('Error fetching device status:', error);
    res.status(500).json({ error: 'Error fetching device status. Please check the device ID and try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
