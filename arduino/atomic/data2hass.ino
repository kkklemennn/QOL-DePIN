#include <WiFiNINA.h>
#include <WiFiServer.h>
#include <ArduinoJson.h>
#include <ECCX08.h>

// Include your Wi-Fi credentials
#include "secrets.h"

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

int status = WL_IDLE_STATUS;
WiFiServer server(80);

// Function to get the first 64 characters of the public key from slot 1 of ECC
String getDeviceID() {
  uint8_t publicKey[64];
  ECCX08.begin();
  if (!ECCX08.generatePublicKey(1, publicKey)) {
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

  server.begin();
}

void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();

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
          } else {
            // Handle other endpoints
            // Generate random temperature and humidity values
            float temperature = random(150, 300) / 10.0;  // Generate a temperature between 15.0 and 30.0
            float humidity = random(300, 700) / 10.0;     // Generate a humidity between 30.0 and 70.0

            // Create a JSON object
            StaticJsonDocument<200> jsonDoc;
            jsonDoc["temperature"] = temperature;
            jsonDoc["humidity"] = humidity;
            String jsonString;
            serializeJson(jsonDoc, jsonString);

            // Generate "HTTP/1.1 200 OK" response
            // Structure: Response headers, content-type, blank line
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type: application/json");
            client.println();

            // Send the JSON response
            client.print(jsonString);

            // The HTTP response ends with another blank line
            client.println();
          }
          break;
        }
      }
    }
    client.stop();
    Serial.println("Client Disconnected.");
  }
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
