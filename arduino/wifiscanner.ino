#include <SPI.h>
#include <WiFiNINA.h>

// Replace with your network credentials
char ssid[] = "YOUR_SSID";
char pass[] = "YOUR_PASSWORD";

int status = WL_IDLE_STATUS;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect
  }

  // Check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    while (1);
  }

  // Print firmware version
  String fv = WiFi.firmwareVersion();
  if (fv < "1.0.0") {
    Serial.println("Please upgrade the firmware");
  }

  // Scan for available networks
  scanNetworks();

  // Attempt to connect to WiFi network:
  connectToWiFi();
}

void loop() {
  // Nothing to do here
}

void scanNetworks() {
  Serial.println("Scanning available networks...");
  int numNetworks = WiFi.scanNetworks();
  if (numNetworks == -1) {
    Serial.println("Failed to scan networks");
    return;
  }

  for (int i = 0; i < numNetworks; i++) {
    Serial.print("Network name: ");
    Serial.println(WiFi.SSID(i));
    Serial.print("Signal strength: ");
    Serial.println(WiFi.RSSI(i));
    Serial.print("Encryption type: ");
    Serial.println(WiFi.encryptionType(i));
    Serial.println("-----------------------");
  }
}

void connectToWiFi() {
  Serial.print("Attempting to connect to SSID: ");
  Serial.println(ssid);

  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);

    // Print status
    printWiFiStatus();

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
}

void printWiFiStatus() {
  // Print the status of the WiFi module
  switch (WiFi.status()) {
    case WL_NO_SHIELD:
      Serial.println("No WiFi shield is present.");
      break;
    case WL_IDLE_STATUS:
      Serial.println("WiFi is in idle status.");
      break;
    case WL_NO_SSID_AVAIL:
      Serial.println("No SSID are available.");
      break;
    case WL_SCAN_COMPLETED:
      Serial.println("Scan completed.");
      break;
    case WL_CONNECTED:
      Serial.println("Connected to WiFi network.");
      break;
    case WL_CONNECT_FAILED:
      Serial.println("Connection failed.");
      break;
    case WL_CONNECTION_LOST:
      Serial.println("Connection lost.");
      break;
    case WL_DISCONNECTED:
      Serial.println("Disconnected from network.");
      break;
    default:
      Serial.println("Unknown status.");
      break;
  }

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
