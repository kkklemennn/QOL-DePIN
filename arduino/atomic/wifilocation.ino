#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include "secrets.h"

// Server details
const char* server = "www.googleapis.com";
const int port = 443;

void setup() {
  Serial.begin(9600);

  // Connect to Wi-Fi
  Serial.print("Connecting to ");
  Serial.println(SECRET_SSID);
  WiFi.begin(SECRET_SSID, SECRET_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  // Get location
  getLocation();
}

void loop() {
  // put your main code here, to run repeatedly:
}

void getLocation() {
  // Scan for Wi-Fi networks
  int numNetworks = WiFi.scanNetworks();
  if (numNetworks == -1) {
    Serial.println("Failed to scan WiFi networks");
    return;
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

  // Make HTTPS request to Google Geolocation API
  WiFiSSLClient client;
  if (!client.connect(server, port)) {
    Serial.println("Connection to server failed");
    return;
  }

  // Send HTTP POST request
  client.println("POST /geolocation/v1/geolocate?key=" + String(SECRET_GOOGLE_API) + " HTTP/1.1");
  client.println("Host: " + String(server));
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(requestBody.length());
  client.println();
  client.println(requestBody);

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

  // Parse response
  StaticJsonDocument<1024> responseDoc;
  DeserializationError error = deserializeJson(responseDoc, response);
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