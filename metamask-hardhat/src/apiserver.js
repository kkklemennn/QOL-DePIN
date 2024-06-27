const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const { Buffer } = require('buffer');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const ec = new EC('p256');

app.get('/health', (req, res) => {
  res.send('OK');
});

app.post('/verify', (req, res) => {
  try {
    const { message, signature, publicKey } = req.body;

    // Log incoming request data
    // console.log('Received request data:', { message, signature, publicKey });

    // Hash the message
    const hash = SHA256(message).toString();

    // Convert signature to appropriate format
    const signatureBytes = Buffer.from(signature, 'hex');
    const r = signatureBytes.slice(0, 32).toString('hex');
    const s = signatureBytes.slice(32, 64).toString('hex');

    // Ensure the public key is correctly formatted with '04' prefix for uncompressed format
    let formattedPublicKey = publicKey;
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
