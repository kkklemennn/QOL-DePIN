#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>
#include <WiFiSSLClient.h>
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
WiFiServer homeAssistantServer(80); // Home Assistant server

// NTP Client to get the current time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

// DHT Sensor
DHT dht(DHTPIN, DHTTYPE);

// Used in loop() function to set up interval for sendin to w3bstream
unsigned long previousMillis = 0;
const long interval = 2 * 60 * 60 * 1000; // Interval for sendData (2 hours)

char API_KEY[] = SECRET_GOOGLE_API;
const char* apiserver = "www.googleapis.com";
const int portSSL = 443;

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

  // Start the Home Assistant server
  homeAssistantServer.begin();
}

void loop() {
  // Check the server for incoming clients
  handleClient();

  // Check if it's time to send data
  // Using millis() handles overflow due to unsigned arithmetic
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    sendData();
  }
}

// Handles incoming client requests from HomeAssistant server
void handleClient() {
  // Listen for incoming clients
  WiFiClient client = homeAssistantServer.available();

  if (client) {
    Serial.println("New client");
    String currentLine = "";
    String request = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        Serial.write(c);
        if (c == '\n') {
          request += currentLine; // Save the request
          currentLine = ""; // Clear the current line
        } else if (c != '\r') {
          currentLine += c;
        }
        
        // If the request is complete, process it
        if (c == '\n' && currentLine.length() == 0) {
          Serial.println("Request: " + request);
          
          if (request.startsWith("GET /id")) {
            // Handle the /id endpoint
            String deviceID = getDeviceID();
            StaticJsonDocument<200> jsonDoc;
            jsonDoc["device_id"] = deviceID;
            String jsonString;
            serializeJson(jsonDoc, jsonString);

            // Send the response
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type: application/json");
            client.println();
            client.print(jsonString);
            client.println();

            // Print response for debugging
            Serial.println("Response: " + jsonString);
          } else {
            // Handle other endpoints
            float temperature, humidity;
            unsigned long timestamp;
            String publicKeyHex;
            readData(temperature, humidity, timestamp, publicKeyHex);

            float roundedTemperature = round(temperature * 10) / 10.0;
            float roundedHumidity = round(humidity * 10) / 10.0;

            // Create a JSON object
            StaticJsonDocument<200> jsonDoc;
            jsonDoc["temperature"] = String(roundedTemperature, 1); // Ensure one decimal place
            jsonDoc["humidity"] = String(roundedHumidity, 1); // Ensure one decimal place
            String jsonString;
            serializeJson(jsonDoc, jsonString);

            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type: application/json");
            client.println();

            // Send the JSON response
            client.print(jsonString);

            // The HTTP response ends with another blank line:
            client.println();

            // Print response for debugging
            Serial.println("Response: " + jsonString);
          }
          break;
        }
      }
    }
    // Ensure the client is disconnected properly
    client.flush();
    client.stop();
    Serial.println("Client Disconnected.");
  }
}

// Function to get the first 64 characters of the public key from slot 1 of ECC
String getDeviceID() {
  uint8_t publicKey[64];
  ECCX08.begin();
  if (!ECCX08.generatePublicKey(slot, publicKey)) {
    Serial.println("Failed to get public key");
    return "";
  }
  String deviceID = "0x";
  for (int i = 0; i < 32; i++) {  // First 64 characters
    char hex[3];
    sprintf(hex, "%02X", publicKey[i]);
    deviceID += hex;
  }
  return deviceID;
}

// Reads temperature and humidity data from the DHT sensor
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

// Gets the device's geographical location
void getLocation(float &latitude, float &longitude, float &accuracy) {
  String requestBody = scanNetworks();  // Execute the scan function to get the request body
  ensureConnection();  // Ensure the connection is stable
  String response = sendDynamicRequest(requestBody);
  parseResponse(response, latitude, longitude, accuracy);
}

// Constructs a JSON message with sensor data and location information
String constructMessage(float temperature, float humidity, unsigned long timestamp, String publicKeyHex, float latitude, float longitude, float accuracy) {
  // Round temperature and humidity to one decimal place and ensure they are floats
  float roundedTemperature = round(temperature * 10) / 10.0;
  float roundedHumidity = round(humidity * 10) / 10.0;

  // Create a JSON object
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["temperature"] = String(roundedTemperature, 1); // Ensure one decimal place
  jsonDoc["humidity"] = String(roundedHumidity, 1); // Ensure one decimal place
  jsonDoc["timestamp"] = String(timestamp);
  jsonDoc["public_key"] = publicKeyHex;
  jsonDoc["latitude"] = String(latitude, 6); // Ensure six decimal places for latitude
  jsonDoc["longitude"] = String(longitude, 6); // Ensure six decimal places for longitude
  jsonDoc["accuracy"] = String(accuracy, 1); // Ensure one decimal place for accuracy

  // Convert JSON object to string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  return jsonString;
}

// Computes the SHA-256 hash of the JSON string and signs it
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

// Prepares the data and sends it to W3bstream
void sendData() {
  // Ensure the NTP client has been updated
  timeClient.update();

  float temperature, humidity;
  unsigned long timestamp;
  String publicKeyHex;

  // Read data
  readData(temperature, humidity, timestamp, publicKeyHex);

  // Get location data
  float latitude, longitude, accuracy;
  getLocation(latitude, longitude, accuracy);

  // Construct JSON message
  String jsonString = constructMessage(temperature, humidity, timestamp, publicKeyHex, latitude, longitude, accuracy);

  // Print the JSON string
  Serial.print("JSON String: ");
  Serial.println(jsonString);

  // Hash, sign and construct the payload
  String payload_str = hashAndSign(jsonString);

  // DEBUG: Print the payload instead of sending it
  Serial.println("Prepared JSON payload:");
  Serial.println(payload_str);

  // Send data to W3bstream
  sendToW3bstream(payload_str);
}

// Sends the constructed payload to the W3bstream server
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

        // Check for end of response
        if (line == "\n" || line == "\r\n") {
          break;
        }
      }
    }
    Serial.println("Client stopped");
    client.stop();
  } else {
    Serial.println("Connection to server failed.");
  }
}

// Prints the current WiFi status to the Serial monitor
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

// Converts a byte array to a hexadecimal string
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

// Prints hexadecimal string to Serial Monitor
void printHex(uint8_t num) {
  char hexCar[2];
  sprintf(hexCar, "%02X", num);
  Serial.print(hexCar);
}

// Scans for available Wi-Fi networks and constructs a request payload
String scanNetworks() {
  Serial.println("Scanning for networks...");
  
  // Scan for Wi-Fi networks
  int numNetworks = WiFi.scanNetworks();
  if (numNetworks == -1) {
    Serial.println("Failed to scan WiFi networks");
    return "";
  }

  // Create JSON request payload
  StaticJsonDocument<1024> doc;
  JsonArray wifiAccessPoints = doc.createNestedArray("wifiAccessPoints");

  for (int i = 0; i < numNetworks; i++) {
    uint8_t bssid[6];
    WiFi.BSSID(i, bssid);
    JsonObject wifiObject = wifiAccessPoints.createNestedObject();
    wifiObject["macAddress"] = macToString(bssid);
    wifiObject["signalStrength"] = WiFi.RSSI(i);
  }

  String requestBody;
  serializeJson(doc, requestBody);

  // Print the serialized JSON for debugging
  Serial.println("Serialized JSON:");
  Serial.println(requestBody);

  return requestBody;
}

// Ensures the WiFi connection is stable and reconnects if necessary
void ensureConnection() {
  Serial.println("Ensuring connection is stable...");

  int retryCount = 0;
  const int maxRetries = 10;

  while (WiFi.status() != WL_CONNECTED && retryCount < maxRetries) {
    Serial.println("Reconnecting to WiFi...");
    WiFi.disconnect();
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(1000);  // Wait a second before retrying
    retryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connection stable.");
    printWiFiStatus();
  } else {
    Serial.println("Failed to stabilize connection.");
  }
}

// Sends a HTTP request to Google geolocation API with the network scan results
String sendDynamicRequest(String requestBody) {
  WiFiSSLClient client;
  if (!client.connect(apiserver, portSSL)) {
    Serial.println("Connection to apiserver failed");
    return "";
  }

  // Send HTTP POST request
  client.println("POST /geolocation/v1/geolocate?key=" + String(API_KEY) + " HTTP/1.1");
  client.println("Host: " + String(apiserver));
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(requestBody.length());
  client.println();
  client.println(requestBody);

  // Print the full request for debugging
  Serial.println("Full Request:");
  Serial.print("POST /geolocation/v1/geolocate?key=");
  Serial.println(String(API_KEY) + " HTTP/1.1");
  Serial.print("Host: ");
  Serial.println(String(apiserver));
  Serial.println("Content-Type: application/json");
  Serial.println("Connection: close");
  Serial.print("Content-Length: ");
  Serial.println(requestBody.length());
  Serial.println();
  Serial.println(requestBody);

  // Read response
  while (client.connected() || client.available()) {
    if (client.available()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") {
        break;
      }
    }
  }

  String response = "";
  while (client.available()) {
    response += client.readString();
  }

  client.stop();

  // Print response for debugging
  Serial.println("Response:");
  Serial.println(response);

  return response;
}

// Parses the response from the Google geolocation API to extract location data
void parseResponse(String response, float &latitude, float &longitude, float &accuracy) {
  // Extract JSON part of the response
  int jsonStartIndex = response.indexOf('{');
  if (jsonStartIndex == -1) {
    Serial.println("No JSON found in the response");
    return;
  }
  String jsonResponse = response.substring(jsonStartIndex);

  // Parse response
  StaticJsonDocument<1024> responseDoc;
  DeserializationError error = deserializeJson(responseDoc, jsonResponse);
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }

  latitude = responseDoc["location"]["lat"];
  longitude = responseDoc["location"]["lng"];
  accuracy = responseDoc["accuracy"];
}

// Converts a MAC address to a human-readable string format
String macToString(const uint8_t* mac) {
  String macStr = "";
  for (int i = 0; i < 6; ++i) {
    if (mac[i] < 0x10) {
      macStr += "0";
    }
    macStr += String(mac[i], HEX);
    if (i < 5) {
      macStr += ":";
    }
  }
  return macStr;
}
