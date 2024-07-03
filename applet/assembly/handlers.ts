import { SendTx, GetDataByRID, JSON, ExecSQL, Log, QuerySQL, ApiCall, GetEnv } from "@w3bstream/wasm-sdk";
import { String, Bool, Float32, Float64 } from "@w3bstream/wasm-sdk/assembly/sql";
import { buildTxData } from "./utils/build-tx";

export { alloc } from "@w3bstream/wasm-sdk";

import { validateMsg, getStringField, getBoolField, getStringAsFloat32Field } from "./helpers";

// Logs a hello world message and validates the device message
export function start(rid: i32): i32 {
  Log("Hello World!");

  const deviceMessage = GetDataByRID(rid);
  Log("device message: " + deviceMessage);

  validateMsg(deviceMessage);

  return 0;
}

// Handles device registration events and stores the device information in the database
export function handle_device_registered(rid: i32): i32 {
  Log("New Device Registered Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Device ID: " + device_id);

  Log("Storing device id in DB...");
  let sql = `INSERT INTO "devices_registry" (device_id, is_registered, is_active) VALUES (?,?,?);`;
  ExecSQL(sql, [new String(device_id), new Bool(true), new Bool(false)]);
  return 0;
}

// Handles device removal events and deletes the device information from the database
export function handle_device_removed(rid: i32): i32 {
  Log("Device Removal Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Removing Device ID: " + device_id);

  Log("Updating device status in DB...");
  let sqlRemove = `DELETE FROM "devices_registry" WHERE device_id = ?;`;
  
  ExecSQL(sqlRemove, [new String(device_id)]);
  
  return 0;
}

// Handles device suspension events and updates the device status to inactive in the database
export function handle_device_suspended(rid: i32): i32 {
  Log("Device Suspension Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Suspending Device ID: " + device_id);

  Log("Updating device status to inactive in DB...");
  let sql = `UPDATE "devices_registry" SET is_active = ? WHERE device_id = ?;`;
  ExecSQL(sql, [new Bool(false), new String(device_id)]);

  return 0;
}

// Handles device activation events and updates the device status to active in the database
export function handle_device_activated(rid: i32): i32 {
  Log("Device Activation Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Activating Device ID: " + device_id);

  Log("Updating device status to active in DB...");
  let sql = `UPDATE "devices_registry" SET is_active = ? WHERE device_id = ?;`;
  ExecSQL(sql, [new Bool(true), new String(device_id)]);

  return 0;
}

// Handles device binding events and stores the information of device_id and its owner in the database
export function handle_device_binding(rid: i32): i32 {
  Log("New Device Binding Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  let owner_address_padded = topics._arr[2] as JSON.Str;

  let owner_address = owner_address_padded.valueOf().slice(26);
  Log("Device ID: " + device_id);
  Log("Owner Address: " + owner_address);

  Log("Storing device binding in DB...");
  let sql = `INSERT INTO "device_binding" (device_id, owner_address) VALUES (?,?);`;
  ExecSQL(sql, [new String(device_id), new String(owner_address)]);
  return 0;
}

// Handles device unbinding events and removes the binding information from the database
export function handle_device_unbinding(rid: i32): i32 {
  Log("Device Unbinding Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Unbinding Device ID: " + device_id);

  Log("Removing device binding from DB...");
  let sqlDelete = `DELETE FROM "device_binding" WHERE device_id = ?;`;
  
  ExecSQL(sqlDelete, [new String(device_id)]);
  
  return 0;
}

// Executed each time a new data message is sent to our W3bstream project
// Processes incoming data messages, validates and stores data, and triggers reward distribution
export function handle_data(rid: i32): i32 {
  Log("New data message received");

  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  assert(validateData(message_json), "Message fields are not valid");
  assert(validateDeviceIdentity(message_json),"Device identity validation failed");
  let owner = get_device_owner(message_json);
  assert(owner != "0x0000000000000000000000000000000000000000","No owner assigned for device");
  storeData(message_json);

  return handle_process_rewards(rid);
}

// Validates the structure and fields of the incoming data message
function validateData(message_json: JSON.Obj): boolean { 
  Log("Validating data message:\n" + message_json.toString())
  let valid: bool = true;
  // Validate the message fields
  if (!(valid = valid && message_json.has("signature"))) Log("device_signature field is missing");
  if (!(valid = valid && message_json.has("data"))) Log("data field is missing");
  
  // Validate the data fields inside the message
  let data_json = message_json.get("data") as JSON.Obj;
  if (!(valid = valid && data_json.has("temperature"))) Log("temperature field is missing");
  if (!(valid = valid && data_json.has("humidity"))) Log("humidity field is missing");
  if (!(valid = valid && data_json.has("timestamp"))) Log("timestamp field is missing");
  if (!(valid = valid && data_json.has("public_key"))) Log("public_key field is missing");

  // For simplicity lat, lon and accuracy can be missing since those are not always critical

  return valid as boolean;
}

// Get the owner of a specific device id from te w3bstream DB
function get_device_owner(message_json: JSON.Obj): string {
  let data_json = message_json.get("data") as JSON.Obj;
  let public_key = getStringField(data_json, "public_key");
  let device_id = publicKeyToDeviceId(public_key);
  Log("Getting owner of device "+ device_id);
  let sql = "SELECT owner_address FROM device_binding WHERE device_id = '" + device_id + "'";
  let result = QuerySQL(sql);
  if (result == "") {
      Log("Device is not bound to any owner");
      return "0x0000000000000000000000000000000000000000";
  }
  let result_json = JSON.parse(result) as JSON.Obj;
  let owner = getStringField(result_json, "owner_address");
  Log("Device owner is: " + owner)
  return (owner);
}

// Rewards the owner of the sent data with 3 TOC tokens  
export function handle_process_rewards(rid: i32): i32 {
  Log("Processing rewards");

  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;

  let data_json = message_json.get("data") as JSON.Obj;
  let public_key = getStringField(data_json, "public_key");
  let device_id = publicKeyToDeviceId(public_key);
  let sql = "SELECT device_id,temperature,humidity FROM data_table WHERE device_id = '"+device_id+"' ORDER BY id DESC LIMIT 1";
  let result = QuerySQL(sql);
  let result_json = JSON.parse(result) as JSON.Obj;
  if (result_json == null) {
    Log("No data found for device ")
    return 1;
  }

  let owner = get_device_owner(message_json);
  Log("Rewarding " + owner + " with 3 Tokens...");
  let tx_hash = mintRewards(owner, 4);
  
  if (tx_hash == "") {
      Log("Sending token rewards failed.")
      return 1;
  }

  return 0;
}

// Mints the ERC20 reward tokens and sends them to the address of the contributor
export function mintRewards(toAddress: string, amountToMint: u64): string {
  const MINT_FUNCTION_SIGNATURE = "40c10f19";  // keccak256 hash of the function signature "mint(address,uint256)"
  const chainId = 4690;
  const ERC20Address = "0x911c3A704c6b5954Aa4d698fb41C77D06d1C579B";

  // Build the transaction data
  const txData = buildTxData(MINT_FUNCTION_SIGNATURE, toAddress, "3");

  // Send the transaction
  const txHash = SendTx(
    chainId,
    ERC20Address,
    "0",  // Value in Wei to send with the transaction, "0" for token minting
    txData
  );

  Log("Transaction hash: " + txHash);

  if (txHash == "") {
    Log("Failed to mint rewards.");
  } else {
    Log("Rewards minted successfully. Transaction hash: " + txHash);
  }
  return txHash;
}

// Convert public key to device ID
function publicKeyToDeviceId(public_key: string): string {
  // Extract the first 64 characters of the public key and prefix with "0x"
  return "0x" + public_key.slice(0, 64);
}

// Verify that the device public key is active
function auth_device(message_json: JSON.Obj): bool {
  Log("Authenticating device public key from DB...");

  let data_json = message_json.get("data") as JSON.Obj;
  let public_key = getStringField(data_json, "public_key");
  let device_id = publicKeyToDeviceId(public_key);
  
  let sql = "SELECT is_active FROM devices_registry WHERE device_id = '" + device_id + "'";
  let result = QuerySQL(sql);
  assert(result != "", "Device is not registered");

  Log("Raw SQL query result: " + result);

  let parsed_result = JSON.parse(result);
  assert(parsed_result.isObj, "Expected result to be a JSON object");
  let result_json = parsed_result as JSON.Obj;
  
  let is_active_value = result_json.get("is_active");
  assert(is_active_value != null && is_active_value.isBool, "is_active field is missing or not a boolean in the query result");

  let is_active = (is_active_value as JSON.Bool).valueOf();
  
  if (is_active) {
    Log("Device is active");
  } else {
    Log("Device is not active");
  }

  return is_active;
}

// // Verify that the message signature is correct and the device public key is active
function validateDeviceIdentity(message_json: JSON.Obj): bool {
  Log("Validating device identity");

  let authorized = auth_device(message_json);
  if (!authorized) {
    Log("Device authentication failed");
    return false;
  }

  let data: JSON.Obj | null = message_json.getObj("data");
  if (data == null) return false;

  let signature = getStringField(message_json, "signature");

  let validSignature = validateSignature(data, signature);
  return validSignature;
}

// Validates the signature of received message to insure integirty
function validateSignature(data: JSON.Obj, signature: string): bool {
  // Get the API URL from the environment variable
  let apiUrl = GetEnv("API_VERIFY_URL");
  if (!apiUrl) {
    Log("API_VERIFY_URL not set");
    return false;
  }

  // Prepare the API request
  let dataStr = data.toString();
  let requestBody = `{
    "data": ${dataStr},
    "signature": "${signature}"
  }`;
  let requestStr = `{
    "Url": "${apiUrl}",
    "Method": "POST",
    "Headers": {
      "Content-Type": "application/json"
    },
    "Body": ${requestBody}
  }`;

  // Make the API call
  const response = ApiCall(requestStr);

  // Parse the response and check the validity
  let responseJSON = JSON.parse(response) as JSON.Obj;
  let isValid = getBoolField(responseJSON, "isValid");
  Log(isValid.toString());
  return isValid;
}

// Stores the data in the W3bstream SQL DB
function storeData(message_json: JSON.Obj): i32 { 
  Log("Storing data message in DB")
  // Get the device data
  let data_json = message_json.get("data") as JSON.Obj;
  
  // Get the temperature
  let temperature = getStringAsFloat32Field(data_json, "temperature");
  
  // Get the humidity
  let humidity = getStringAsFloat32Field(data_json, "humidity");
  
  // Get the timestamp
  let timestamp = getStringField(data_json, "timestamp");

  // Get the public key
  let public_key = getStringField(data_json, "public_key");
  let deviceId = publicKeyToDeviceId(public_key);

  // Get the lat
  let lat = getStringAsFloat32Field(data_json, "latitude");

  // Get the lon
  let lon = getStringAsFloat32Field(data_json, "longitude");

  // Get the accuracy
  let accuracy = getStringAsFloat32Field(data_json, "accuracy");

  // Store the data in the W3bstream SQL Database
  const query = `INSERT INTO "data_table" (device_id,temperature,humidity,timestamp,lat,lon,accuracy) VALUES (?,?,?,?,?,?,?);`;
  const value = ExecSQL(
      query, 
      [new String(deviceId), new Float32(temperature), new Float32(humidity), new String(timestamp), new Float32(lat), new Float32(lon), new Float32(accuracy)]);
  Log("Query returned: " + value.toString());

  return value;
}

