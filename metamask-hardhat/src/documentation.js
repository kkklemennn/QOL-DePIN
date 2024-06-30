import React from 'react';

const Documentation = () => (
  <div className="container">
    <h2>Workflow Documentation</h2>
    <ol>
      <li>Plug in the computer to set WiFi credentials using the serial monitor.</li>
      <li>After connecting, add the magbtc integration to Home Assistant and input the IP of the device.</li>
      <li>You will see the device ID, which you use in the magbtc device manager to bind it to yourself (auth code will be written on the device itself).</li>
      <li>You can use it as a regular sensor, or activate it in the magbtc device manager to "contribute to the community and get TOC rewards".</li>
      <li>This basically sends the data to W3bstream and rewards the user with tokens.</li>
    </ol>
  </div>
);

export default Documentation;
