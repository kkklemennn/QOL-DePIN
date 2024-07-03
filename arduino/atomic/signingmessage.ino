#include <ArduinoECCX08.h>
#include <ArduinoJson.h>
#include <Wire.h>

const int slot = 1;

void setup() {
  Serial.begin(9600);
  while (!Serial);

  if (!ECCX08.begin()) {
    Serial.println("Failed to initialize ECCX08!");
    while (1);
  }

  if (!ECCX08.locked()) {
    Serial.println("The ECC508/ECC608 is not locked!");
    while (1);
  }

  Serial.println("ECCX08 initialized successfully.");

  // Generate a random message
  int sensor_reading = 33;
  long timestamp = 1719421407;

  // Retrieve the public key from slot 1
  byte publicKey[64];
  if (!ECCX08.generatePublicKey(slot, publicKey)) {
    Serial.println("Failed to retrieve public key.");
    return;
  }

  // Convert public key to hex string
  char publicKeyHex[129]; // 64 bytes * 2 chars/byte + 1 null terminator
  for (int i = 0; i < 64; i++) {
    sprintf(&publicKeyHex[i * 2], "%02x", publicKey[i]);
  }

  // Create a JSON object
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["sensor_reading"] = sensor_reading;
  jsonDoc["timestamp"] = timestamp;
  jsonDoc["public_key"] = publicKeyHex;

  // Convert JSON object to string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Convert JSON string to byte array (UTF-8 encoding)
  int data_len = jsonString.length();
  byte data_bytes[data_len + 1];
  jsonString.getBytes(data_bytes, data_len + 1);

  // Print the JSON string
  Serial.print("JSON String: ");
  Serial.println(jsonString);

  // Print the byte array
  Serial.print("Byte Array: ");
  for (int i = 0; i < data_len; i++) {
    Serial.print(data_bytes[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  // Compute SHA-256 hash of the message
  byte *data_ptr = data_bytes;
  int nbr_blocks = data_len / 64;
  byte mySHA[32];
  ECCX08.beginSHA256();

  for (int i = 0; i < nbr_blocks; i++) {
    ECCX08.updateSHA256(data_ptr);
    data_ptr += 64;
  }
  ECCX08.endSHA256(data_ptr, data_len - nbr_blocks * 64, mySHA);

  Serial.print("SHA result: ");
  for (int i = 0; i < sizeof(mySHA); i++) {
    printHex(mySHA[i]);
  }
  Serial.println();

  // Print the hash in hex format
  Serial.print("Hash (hex): ");
  for (int i = 0; i < sizeof(mySHA); i++) {
    if (mySHA[i] < 16) {
      Serial.print('0');
    }
    Serial.print(mySHA[i], HEX);
  }
  Serial.println();

  // Sign the hash (must be 32 bytes)
  byte signature[64];
  if (!ECCX08.ecSign(slot, mySHA, signature)) {
    Serial.println("Failed to sign the message.");
    return;
  }

  // Print the JSON message and the signature
  Serial.print("Message: ");
  Serial.println(jsonString);
  Serial.print("Signature: ");
  for (int i = 0; i < 64; i++) {
    if (signature[i] < 16) {
      Serial.print('0');
    }
    Serial.print(signature[i], HEX);
  }
  Serial.println();

  // Print the public key
  Serial.print("Public key of slot ");
  Serial.print(slot);
  Serial.print(" is:   ");
  printBufferHex(publicKey, sizeof(publicKey));

  // Validate the signature
  if (ECCX08.ecdsaVerify(mySHA, signature, publicKey)) {
    Serial.println("Verified signature successfully :D");
  } else {
    Serial.println("Oh no! Failed to verify signature :(");
  }
}

void loop() {
  // pass
}

void printHex(uint8_t num) {
  char hexCar[2];
  sprintf(hexCar, "%02X", num);
  Serial.print(hexCar);
}

void printBufferHex(const byte input[], int inputLength) {
  for (int i = 0; i < inputLength; i++) {
    Serial.print(input[i] >> 4, HEX);
    Serial.print(input[i] & 0x0f, HEX);
  }
  Serial.println();
}
