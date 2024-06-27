import { JSON } from "@w3bstream/wasm-sdk";

import { getField, getPayloadValue } from "./utils/payload-parser";
import { validateField } from "./utils/message-validation";

export function validateMsg(message: string): void {
  const payload = getPayloadValue(message);
  validateField<JSON.Str>(payload, "public_key");
  validateField<JSON.Str>(payload, "signature");

  const data = getField<JSON.Obj>(payload, "data");
  validateField<JSON.Integer>(data!, "timestamp");
  validateField<JSON.Float>(data!, "sensor_reading");
}

export function getStringField(jsonObj: JSON.Obj, fieldName: string): string {
  const field = getField<JSON.Str>(jsonObj, fieldName);
  return field ? field.valueOf() : "";
}


export function getFloatField(jsonObj: JSON.Obj, fieldName: string): f64 {
  const field = jsonObj.get(fieldName);
  if (field && field.isNum) {
    // Convert the numeric JSON value to string and then parse it
    let numStr = field.toString();
    return f64.parse(numStr);
  }
  return -1.0; // Sentinel value for errors
}

export function getFloat32Field(jsonObj: JSON.Obj, fieldName: string): f32 {
  const field = jsonObj.get(fieldName);
  if (field && field.isNum) {
    // Convert the numeric JSON value to string and then parse it
    let numStr = field.toString();
    return f32.parse(numStr);
  }
  return -1.0; // Sentinel value for errors
}

export function getInt64Field(jsonObj: JSON.Obj, fieldName: string): i64 {
  const field = jsonObj.get(fieldName);
  if (field && field.isNum) {
    // Assuming the number is represented as a string to handle large values
    let numStr = field.toString();
    return i64.parse(numStr, 10);
  } else if (field && field.isString) {
    // If the field is intentionally stored as a string to preserve precision
    let str = (field as JSON.Str).valueOf();
    return i64.parse(str, 10);
  }
  return -1; // Sentinel value for errors or not found
}