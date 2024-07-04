# Device manager Webapp
This directory contains the source code and configuration for a React-based web application and a beckand API. They are used for managing IoT devices and interacting with the smart contracts.

The application is used in HomeAssistant as a tab for managing the user's devices. 

The API is used to perform signature verifications.

## Running the webapp and API server

We are using the package concurrently to use the command `npm start`, to run the web application (on port 3001) in development mode and the API server (on port 5000) concurrently.

Open [http://localhost:3001](http://localhost:3001) to view it in your browser. \
Runs [http://localhost:5000](http://localhost:5000) the API server for verifying the signatures.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Example API calls

### Signature verification
- METHOD: `POST`
- URL: `http://localhost:5000/verify`
- HEADERS:
    - key: `Content-Type`
    - val: `application/json`
- BODY:
```
{
    "data": {
        "temperature": "25.8",
        "humidity": "48.0",
        "timestamp": "1720047574",
        "public_key": "cc6d788fc040dfa2987d69a8c2f78ac70e06b0b747003f8158db146104eb894f6b75aa1531e1b813148ebdf1e0db3af409c8b1d7eb8b1c6c23c6b61ef75e262b",
        "latitude": "46.050030",
        "longitude": "14.468389",
        "accuracy": "9.0"
    },
    "signature": "0e11bcc3c81d9a1453cf994074e4bd8de69c8f878df1b0a4fb59688a7cba46fe75d9f76183713f20e95a2571c0f0690c0210e35148c14f7f62a5e0b9fb6627ae"
}
```
- EXPECTED RESPONSE:
```
{
  "isValid": true
}
```

### Health check
- METHOD: `GET`
- URL: `http://localhost:5000/health`
- EXPECTED RESPONSE:
```
OK
```

## File and directory structure:
`package.json`:
Defines the project's dependencies, scripts and configuration settings.

`package-lock.json`:
Automatically generated file that locks the versions of dependencies

`public`:
Contains static files and assets used in the application

`src`:
Contains the source code for the React application and API server.

