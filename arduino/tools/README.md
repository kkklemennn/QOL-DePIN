# tools
Contains the code for utility scripts for essential tasks such as securely generating public keys and scanning WiFi networks.

## ECCX08 signatures
Here are the files for generating a PEM public key or self signed certificate for a private key generated in ECC crypto chip slot.
It also includes the sketch for generating a sample message, signing it and verifying the signature.

Source: https://github.com/arduino-libraries/ArduinoECCX08

### Example output:

Generating a PEM private key for JWS
```
16:14:19.500 -> Hi there, in order to generate a PEM public key for your board, we'll need the following information ...
16:14:19.500 -> 
16:14:19.500 -> What slot would you like to use? (0 - 4) [0]: 1
16:16:17.926 -> Would you like to generate a new private key? (Y/n) [Y]: y
16:16:21.981 -> 
16:16:22.120 -> Here's your public key PEM, enjoy!
16:16:22.120 -> 
16:16:22.120 -> -----BEGIN PUBLIC KEY-----
16:16:22.120 -> MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyynPZZPEzy0SSdLIzOFFYHaUiDDFXIops5JeMFvK
16:16:22.120 -> gjfLATzLlyuQF5CaRZo/5lRV+pXuPOp8b2Klt3uxYmus8g==
16:16:22.120 -> -----END PUBLIC KEY-----
```
Testing the signing
```
15:58:03.920 -> SHA1: c492186e8d4cb976e92d97831127ab6b09b0a925
16:03:06.119 -> ECCX08 Signing
16:03:06.119 -> 
16:03:06.119 -> Input is:                  000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F
16:03:06.259 -> Public key of slot 0 is:   B7837C05C2CA88405522B4EE40BA3C1B53358DB34A9FA9AFD7FE4572F0750697F5B0A96BE31333E4307AB29EAC354126C68DE4754004ADBC867D9A4F88F9807F
16:03:06.371 -> Signature using slot 0 is: 9A482B4F6CD462E050328B4833DF451CBBCDF8CCCC8238C31C53F38BDA92BAC9FE929F3406A22EA6D10FDEEB5AB3C5F3C8DD9FB148914B7E1175C3D67472A24D
16:03:06.415 -> 
16:03:06.489 -> Verified signature successfully :D
```

## wifiscanner.ino
Arduino code that scans all the available wifi networks and connects to the set one with "YOUR_SSID".