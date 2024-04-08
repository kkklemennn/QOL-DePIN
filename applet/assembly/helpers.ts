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

export function getStringField(jsonObj: JSON.Obj, fieldName: string): string | null {
  try {
    validateField<JSON.Str>(jsonObj, fieldName);
    const field = getField<JSON.Str>(jsonObj, fieldName);
    return field ? field.valueOf() : null;
  } catch (error) {
    console.error(`Error fetching string field '${fieldName}': ${error}`);
    return null;
  }
}

export function getFloatField(jsonObj: JSON.Obj, fieldName: string): number | null {
  try {
    validateField<JSON.Num>(jsonObj, fieldName);
    const field = jsonObj.get(fieldName);
    if (field instanceof JSON.Num) {
      return field.valueOf() as number;
    }
  } catch (error) {
    console.error(`Error validating or fetching float field '${fieldName}': ${error}`);
  }
  return null;
}

export function getIntField(jsonObj: JSON.Obj, fieldName: string): number | null {
  try {
    validateField<JSON.Num>(jsonObj, fieldName);

    const field = jsonObj.get(fieldName);
    if (field instanceof JSON.Num) {
      return Math.floor(field.valueOf() as number);
    }
  } catch (error) {
    console.error(`Error validating or fetching int field '${fieldName}': ${error}`);
  }
  return null;
}