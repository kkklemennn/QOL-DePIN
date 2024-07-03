#include <WiFiNINA.h>
#include <WiFiSSLClient.h>
#include <ArduinoJson.h>

// Include your Wi-Fi credentials
#include "secrets.h"

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;
char API_KEY[] = SECRET_GOOGLE_API;
const char* apiserver = "www.googleapis.com";
const int port = 443;

int status = WL_IDLE_STATUS;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  // Check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    while (true);
  }

  // Attempt to connect to WiFi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);

    // wait 10 seconds for connection:
    delay(10000);
  }

  Serial.println("Connected to wifi");
  printWiFiStatus();

  String requestBody = scanNetworks();  // Execute the scan function to get the request body
  ensureConnection();  // Ensure the connection is stable
  String response = sendDynamicRequest(requestBody);
  parseResponse(response);
}

void loop() {
  // pass
}

void printWiFiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

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

void ensureConnection() {
  Serial.println("Ensuring connection is stable...");

  int retryCount = 0;
  const int maxRetries = 10;

  while (WiFi.status() != WL_CONNECTED && retryCount < maxRetries) {
    Serial.println("Reconnecting to WiFi...");
    WiFi.disconnect();
    WiFi.begin(ssid, pass);
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

String sendDynamicRequest(String requestBody) {
  WiFiSSLClient client;
  if (!client.connect(apiserver, port)) {
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

void parseResponse(String response) {
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

  float latitude = responseDoc["location"]["lat"];
  float longitude = responseDoc["location"]["lng"];
  float accuracy = responseDoc["accuracy"];

  // Print location data
  Serial.print("Latitude: ");
  Serial.println(latitude, 7);
  Serial.print("Longitude: ");
  Serial.println(longitude, 7);
  Serial.print("Accuracy: ");
  Serial.println(accuracy);
}

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
