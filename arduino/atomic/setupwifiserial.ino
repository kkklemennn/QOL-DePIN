#include <SPI.h>
#include <WiFiNINA.h>
#include <FlashStorage.h>

char ssid[32] = "";
char pass[64] = "";
WiFiServer server(80);

// Define a structure to hold the Wi-Fi credentials
struct WiFiCredentials {
  char ssid[32];
  char pass[64];
};

// Create a FlashStorage variable to store Wi-Fi credentials
FlashStorage(wifi_storage, WiFiCredentials);

void setup() {
    Serial.begin(115200);

    // Wait for Serial Monitor to open
    while (!Serial) {
        ; // wait for serial port to connect. Needed for native USB
    }

    delay(2000);  // Give the user time to open the Serial Monitor

    // Read stored credentials
    readCredentials();

    // Check if there are no credentials
    if (strlen(ssid) == 0 || strlen(pass) == 0) {
        Serial.println("No Wi-Fi credentials found.");
    } else {
        // Attempt to connect to Wi-Fi
        connectToWiFi();

        // Check if connection is successful
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nConnected to Wi-Fi");
        } else {
            Serial.println("\nFailed to connect to Wi-Fi");
        }
    }

    // Check for the reset command
    checkForResetCommand();
}

void loop() {
    // Main loop
    checkForResetCommand();
}

void connectToWiFi() {
    if (strlen(ssid) > 0) {
        Serial.println("\nConnecting to Wi-Fi...");
        WiFi.begin(ssid, pass);
        unsigned long startAttemptTime = millis();

        // Wait for connection attempt
        while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
            delay(100);
            Serial.print(".");
        }

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nConnected to Wi-Fi");
        } else {
            Serial.println("\nFailed to connect to Wi-Fi");
        }
    }
}

void checkForResetCommand() {
    while (Serial.available() > 0) {
        String command = Serial.readStringUntil('\n');
        command.trim();
        if (command == "resetwifi") {
            getCredentialsFromSerial();
            saveCredentials();
            connectToWiFi();
            break;
        }
    }
}

void getCredentialsFromSerial() {
    Serial.println("\nEnter new Wi-Fi credentials");

    Serial.print("SSID: ");
    while (Serial.available() == 0) { }
    String ssidInput = Serial.readStringUntil('\n');
    ssidInput.trim();
    ssidInput.toCharArray(ssid, sizeof(ssid));

    Serial.print("Password: ");
    while (Serial.available() == 0) { }
    String passInput = Serial.readStringUntil('\n');
    passInput.trim();
    passInput.toCharArray(pass, sizeof(pass));
}

void saveCredentials() {
    // Create a WiFiCredentials structure
    WiFiCredentials credentials;
    strcpy(credentials.ssid, ssid);
    strcpy(credentials.pass, pass);

    // Save the structure to flash memory
    wifi_storage.write(credentials);
}

void readCredentials() {
    // Read the structure from flash memory
    WiFiCredentials credentials = wifi_storage.read();

    // Copy the credentials to the global variables
    strcpy(ssid, credentials.ssid);
    strcpy(pass, credentials.pass);
}
