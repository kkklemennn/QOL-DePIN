#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <ArduinoECCX08.h>
#include <ArduinoJson.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include "secrets.h"

#define DHTPIN 2     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11   // DHT11 - BLUE, DHT22 WHITE

int status = WL_IDLE_STATUS;
const int slot = 1; // private key slot (1 = PEM)
char server[] = "dev.w3bstream.com";
int port = 8889;
WiFiClient client;

// NTP Client to get the current time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

// DHT Sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect
  }

  // Initialize the DHT sensor
  dht.begin();

  // Initialize the ECCX08 module
  Serial.println("Initializing ECCX08...");
  if (!ECCX08.begin()) {
    Serial.println("Failed to initialize ECCX08!");
    while (1);
  }

  if (!ECCX08.locked()) {
    Serial.println("The ECC508/ECC608 is not locked!");
    while (1);
  } else {
    Serial.println("ECCX08 initialized successfully!");
  }

  // Check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    while (1);
  }

  // Attempt to connect to WiFi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(SECRET_SSID);
    status = WiFi.begin(SECRET_SSID, SECRET_PASS);

    // Wait 10 seconds for connection:
    delay(10000);
  }

  // Print the status after attempting to connect
  if (status == WL_CONNECTED) {
    Serial.println("Connected to WiFi");
    printWiFiStatus();
  } else {
    Serial.print("Failed to connect, status: ");
    Serial.println(status);
  }

  // Initialize the NTP client
  timeClient.begin();

  sendData();
}

void loop() {
  // sendData();
  // delay(60000); // send data every 60 seconds
}

void readData(float &temperature, float &humidity, unsigned long &timestamp, String &publicKeyHex) {
  // Get the current Unix timestamp
  timestamp = timeClient.getEpochTime();

  // Read data from DHT11 sensor
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // Check if any reads failed and set values to -1.0 if so
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    humidity = -1.0;
    temperature = -1.0;
  }

  // Retrieve the public key from slot 1
  byte publicKey[64];
  if (!ECCX08.generatePublicKey(slot, publicKey)) {
    Serial.println("Failed to retrieve public key.");
    return;
  }

  // Convert public key to hex string
  char publicKeyHexArray[129]; // 64 bytes * 2 chars/byte + 1 null terminator
  for (int i = 0; i < 64; i++) {
    sprintf(&publicKeyHexArray[i * 2], "%02x", publicKey[i]);
  }
  publicKeyHex = String(publicKeyHexArray);
}

String constructMessage(float temperature, float humidity, unsigned long timestamp, String publicKeyHex) {
  // Create a JSON object
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;
  jsonDoc["timestamp"] = String(timestamp);
  jsonDoc["public_key"] = publicKeyHex;

  // Convert JSON object to string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  return jsonString;
}

String hashAndSign(String jsonString) {
  // Convert JSON string to byte array (UTF-8 encoding)
  int data_len = jsonString.length();
  byte data_bytes[data_len + 1];
  jsonString.getBytes(data_bytes, data_len + 1);

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

  // Sign the hash (must be 32 bytes)
  byte signature[64];
  if (!ECCX08.ecSign(slot, mySHA, signature)) {
    Serial.println("Failed to sign the message.");
    return "";
  }

  // Convert signature to hex string
  String signature_hex = byteArrayToHexString(signature, sizeof(signature));

  // Print the signature
  Serial.print("Signature: ");
  Serial.println(signature_hex);

  // Prepare the full payload
  StaticJsonDocument<512> payload;
  payload["data"] = serialized(jsonString);
  payload["signature"] = signature_hex;

  String payload_str;
  serializeJson(payload, payload_str);

  return payload_str;
}

void sendData() {
  // Ensure the NTP client has been updated
  timeClient.update();

  float temperature, humidity;
  unsigned long timestamp;
  String publicKeyHex;

  // Read data
  readData(temperature, humidity, timestamp, publicKeyHex);

  // Construct JSON message
  String jsonString = constructMessage(temperature, humidity, timestamp, publicKeyHex);

  // Print the JSON string
  Serial.print("JSON String: ");
  Serial.println(jsonString);

  // Hash, sign and construct the payload
  String payload_str = hashAndSign(jsonString);

  // DEBUG: Print the payload instead of sending it
  Serial.println("Prepared JSON payload:");
  Serial.println(payload_str);

  // Send data to W3bstream
  // sendToW3bstream(payload_str);
}

void sendToW3bstream(String payload_str) {
  if (client.connect(server, port)) {
    client.print("POST /srv-applet-mgr/v0/event/");
    client.print(SECRET_PROJECT_NAME);
    client.print("?eventType=");
    client.print(SECRET_EVENT_TYPE);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(server);
    client.println("Content-Type: application/json");
    client.print("Authorization: Bearer ");
    client.println(SECRET_PUB_TOKEN);
    client.print("Content-Length: ");
    client.println(payload_str.length());
    client.println();
    client.println(payload_str);

    // Check the response
    while (client.connected()) {
      if (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
      }
    }
    client.stop();
  } else {
    Serial.println("Connection to server failed.");
  }
}

void printWiFiStatus() {
  // Print the SSID of the network you're connected to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // Print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // Print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

String byteArrayToHexString(byte *buffer, int length) {
  String hexString = "";
  for (int i = 0; i < length; i++) {
    if (buffer[i] < 0x10) {
      hexString += "0";
    }
    hexString += String(buffer[i], HEX);
  }
  return hexString;
}

void printHex(uint8_t num) {
  char hexCar[2];
  sprintf(hexCar, "%02X", num);
  Serial.print(hexCar);
}
