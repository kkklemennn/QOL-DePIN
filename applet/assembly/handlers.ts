import { GetDataByRID, JSON, ExecSQL, Log, QuerySQL } from "@w3bstream/wasm-sdk";
import { String, Bool } from "@w3bstream/wasm-sdk/assembly/sql";

export { alloc } from "@w3bstream/wasm-sdk";

import { validateMsg, getStringField, getFloatField, getInt64Field } from "./helpers";

export function start(rid: i32): i32 {
  Log("Hello World!");

  const deviceMessage = GetDataByRID(rid);
  Log("device message: " + deviceMessage);

  validateMsg(deviceMessage);

  return 0;
}

export function handle_device_registered(rid: i32): i32 {
  Log("New Device Registered Detected: ");
  let message_string = GetDataByRID(rid);
  let message_json = JSON.parse(message_string) as JSON.Obj;
  let topics = message_json.get("topics") as JSON.Arr;
  let device_id = topics._arr[1].toString();
  Log("Device ID: " + device_id);

  Log("Storing device id in DB...");
  let sql = `INSERT INTO "devices_registry" (device_id, is_registered, is_active) VALUES (?,?,?);`;
  ExecSQL(sql, [new String(device_id), new Bool(true), new Bool(true)]);
  return 0;
}

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

// This handler will be executed each time a new data message 
// is sent to our W3bstream project
export function handle_data(rid: i32): i32 {
  Log("New data message received");
  // Get the device data message from the W3bstream host
  let message_string = GetDataByRID(rid);
  // Parse the data message into a JSON object
  let message_json = JSON.parse(message_string) as JSON.Obj;
  // validate fields
  assert(validateData(message_json), "Message fields are not valid");
  // Verify device signature
  // assert(validateDeviceIdentity(message_json),"Device identity validation failed");
  // make sure the device has an owner assigned
  // let owner = get_device_owner(message_json);
  // assert(owner != CONST.ZERO_ADDRESS,"No owner assigned for device");
  // Store the IoT data along with the device id 
  storeData(message_json);

  // For simplicity, let's evaluate rewards here (however, a dedicated
  // message should be sent periodically!)
  return 0
  // return handle_process_rewards(rid);
}

function validateData(message_json: JSON.Obj): boolean { 
  Log("Validating data message:\n" + message_json.toString())
  let valid: bool = true;
  // Validate the message fields
  if (!(valid = valid && message_json.has("public_key"))) Log("public_key field is missing");
  if (!(valid = valid && message_json.has("signature"))) Log("device_signature field is missing");
  if (!(valid = valid && message_json.has("data"))) Log("data field is missing");
  
  let data_json = message_json.get("data") as JSON.Obj;
  if (!(valid = valid && data_json.has("sensor_reading"))) Log("sensor_reading field is missing");
  if (!(valid = valid && data_json.has("timestamp"))) Log("timestamp field is missing");

  return valid as boolean;
} 

// Simply rewards the most recent data message in the DB  
// but more complex logic could be implemented here
// export function handle_process_rewards(rid: i32): i32 {
//   Log("Processing rewards");

//   // Get the device data message from the W3bstream host
//   let message_string = GetDataByRID(rid);
//   // Parse the data message into a JSON object
//   let message_json = JSON.parse(message_string) as JSON.Obj;

//   // Get the public key from the message
//   let public_key = getStringField(message_json, "public_key");
//   // Get the latest IoT data point sent by the device
//   let sql = "SELECT public_key,sensor_reading FROM data_table WHERE public_key = '"+public_key+"' ORDER BY id DESC LIMIT 1";
//   let result = QuerySQL(sql);
//   let result_json = JSON.parse(result) as JSON.Obj;
//   if (result_json == null) {
//     log("No data found for device ")
//     return 1;
//   }
//   // Get the power consumption
//   let sensor_reading = parseFloat(getStringField(result_json, "sensor_reading"));  
//   if (sensor_reading < 4.0) {
//     // Rewards the device owner
//     let owner = get_device_owner(message_json);
//     log("Rewarding " + owner + " with 3 ECO Tokens...");
//     let tx_hash = mintRewards(CONST.TOKEN_CONTRACT, owner, CONST.FOUR_TOKENS_HEX);
//     if (tx_hash == "") {
//         log("Sending token rewards failed.")
//         return 1;
//     }
//     log("Reward transaction hash: " + tx_hash);
//   } else {
//     log("Power consumption too high, no rewards sent.");
//   }

//   return 0;
// }

// // Verify that the device public key is authorized
// function auth_device(message_json: JSON.Obj): bool {
//   log("Authenticating device public key from DB...")
//   // Get the public key from the message
//   let public_key = getStringField(message_json, "public_key");
//   // Get the device id from the message
//   let device_id = publicKeyToDeviceId(public_key);
//   let sql = "SELECT is_active FROM device_registry WHERE device_id = '" + device_id + "'";
//   let result = QuerySQL(sql);
//   assert(result != "", "Device is not registered");

//   let result_json = JSON.parse(result) as JSON.Obj;
//   let is_active = getStringField(result_json, "is_active");
//   if (is_active == "true") log("Device is authorized"); 
//   else if (is_active == "false") log("Device is banned");

//   return (is_active == "true");
// }

// // Get the owner of a specific device id from te w3bstream DB
// function get_device_owner(message_json: JSON.Obj): string {
//   // Get the device id from the message
//   let public_key = getStringField(message_json, "public_key");
//   let device_id = publicKeyToDeviceId(public_key);
//   log("Getting owner of device "+ device_id);
//   let sql = "SELECT owner_address FROM device_bindings WHERE device_id = '" + device_id + "'";
//   let result = QuerySQL(sql);
//   if (result == "") {
//       log("Device is not bound to any owner");
//       return CONST.ZERO_ADDRESS;
//   }
//   let result_json = JSON.parse(result) as JSON.Obj;
//   let owner = getStringField(result_json, "owner_address");
//   log("Device owner is: " + owner)
//   return (owner);
// }

// // Verify that the message signature is correct and the device public key is authorized
// function validateDeviceIdentity(message_json: JSON.Obj): bool {
//   log("Validating device identity")
//   // Get the public key from the message
//   let public_key = getStringField(message_json, "public_key");
//   // Verify that the device public key is authorized in the contract
//   let authorized = auth_device(message_json)
//   if (!authorized) {
//       log("Device authentication failed");
//       return false;
//   }
//   // Get the signature from the message
//   let signature = getStringField(message_json, "signature");
//   // Get the data object
//   let data: JSON.Obj | null = message_json.getObj("data");
//   if (data == null) return 0;
//   // Perform signature verification
//   let signature_ok = verifySig(public_key, signature, data.toString());
//   if (!signature_ok) {
//       log("Data signature is not valid");
//       return false;
//   }
//   log("Data signature is valid")
//   return true;
// }

function storeData(message_json: JSON.Obj): i32 { 
  Log("Storing data message in DB64")
  // Get the device public key
  let public_key = getStringField(message_json, "public_key");
  // Get the device data
  let data_json = message_json.get("data") as JSON.Obj;
  // Get the sensor reading
  let sensor_reading = getFloatField(data_json, "sensor_reading");
  const sensor_reading_str: string = sensor_reading.toString(); // Convert f64 to string
  // Get the timestamp
  let timestamp = getStringField(data_json, "timestamp");
  // Store the data in the W3bstream SQL Database
  const query = `INSERT INTO "data_table" (public_key,sensor_reading,timestamp) VALUES (?,?,?);`;
  const value = ExecSQL(
      query, 
      [new String(public_key), new String(sensor_reading_str), new String(timestamp)]);
  Log("Query returned: " + value.toString());

  return value;
}
