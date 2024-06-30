import React from 'react';

const VerifySignature = ({
  message,
  signature,
  setMessage,
  setSignature,
  handleVerify,
  verificationResult
}) => (
  <div className="container">
    <h2>Manual signature verification</h2>
    <div className="form-group">
      <textarea
        className="form-control"
        rows="5"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
    <div className="form-group">
      <textarea
        className="form-control"
        rows="2"
        placeholder="Signature"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
      />
    </div>
    <button className="btn btn-primary" onClick={handleVerify}>Verify</button>
    <p>{verificationResult}</p>
  </div>
);

export default VerifySignature;
