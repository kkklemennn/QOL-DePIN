#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <ArduinoECCX08.h>
#include <ArduinoJson.h>
#include "secrets.h"

int status = WL_IDLE_STATUS;

char server[] = "dev.w3bstream.com";
int port = 8889;

WiFiClient client;

// NTP Client to get the current time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect
  }

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
}

void loop() {
  timeClient.update(); // Update the time
  sendData();
  delay(20000); // send data every 60 seconds
}

void sendData() {
  // Ensure the NTP client has been updated
  timeClient.update();

  // Get the current Unix timestamp
  unsigned long timestamp = timeClient.getEpochTime();

  // Dummy sensor data
  float sensor_reading = random(0, 100) / 1.0;

  StaticJsonDocument<256> data_payload;
  data_payload["sensor_reading"] = sensor_reading;
  data_payload["timestamp"] = timestamp;

  String data_payload_str;
  serializeJson(data_payload, data_payload_str);

  // Get the public key
  byte public_key[64];
  if (!ECCX08.generatePublicKey(0, public_key)) {
    Serial.println("Failed to get public key");
    return;
  }

  Serial.print("Public key is: ");
  printBufferHex(public_key, sizeof(public_key));

  // Ensure the data is 32 bytes for signing (padded if necessary)
  byte data_to_sign[32];
  memset(data_to_sign, 0, sizeof(data_to_sign));  // Initialize with zeros
  strncpy((char*)data_to_sign, data_payload_str.c_str(), sizeof(data_to_sign));

  // Sign the data payload
  byte signature[64];
  if (!ECCX08.ecSign(0, data_to_sign, signature)) {
    Serial.println("Failed to sign data");
    return;
  }

  // Convert public key and signature to hex strings
  String public_key_hex = byteArrayToHexString(public_key, sizeof(public_key));
  String signature_hex = byteArrayToHexString(signature, sizeof(signature));

  // Prepare the full payload
  StaticJsonDocument<512> payload;
  payload["data"] = data_payload;
  payload["public_key"] = public_key_hex;
  payload["deviceId"] = "0x" + public_key_hex.substring(0, 64); // Generate device ID
  payload["signature"] = signature_hex;

  String payload_str;
  serializeJson(payload, payload_str);

  // DEBUG: Print the payload instead of sending it
  Serial.println("Prepared JSON payload:");
  Serial.println(payload_str);

  // if (client.connect(server, port)) {
  //   client.print("POST /srv-applet-mgr/v0/event/");
  //   client.print(SECRET_PROJECT_NAME);
  //   client.print("?eventType=");
  //   client.print(SECRET_EVENT_TYPE);
  //   client.println(" HTTP/1.1");
  //   client.print("Host: ");
  //   client.println(server);
  //   client.println("Content-Type: application/json");
  //   client.print("Authorization: Bearer ");
  //   client.println(SECRET_PUB_TOKEN);
  //   client.print("Content-Length: ");
  //   client.println(payload_str.length());
  //   client.println();
  //   client.println(payload_str);

  //   // Check the response
  //   while (client.connected()) {
  //     if (client.available()) {
  //       String line = client.readStringUntil('\r');
  //       Serial.print(line);
  //     }
  //   }
  //   client.stop();
  // } else {
  //   Serial.println("Connection to server failed.");
  // }
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

// alternative to byteArrayToHexString
void printBufferHex(const byte input[], int inputLength) {
  for (int i = 0; i < inputLength; i++) {
    Serial.print(input[i] >> 4, HEX);
    Serial.print(input[i] & 0x0f, HEX);
  }
  Serial.println();
}
