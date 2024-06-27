### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.
Runs [http://localhost:5000](http://localhost:5000) the API server for verifying the signatures.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Example API call
- METHOD: `POST`
- URL: `http://localhost:5000/verify`
- HEADERS:
    - key: `Content-Type`
    - val: `application/json`
- BODY:
```
    {
    "message": "{\"sensor_reading\":33,\"timestamp\":1719421407}",
    "signature": "0677F7B08D36FB1CBC37A08797A0A959C1C865154D3E3392DCA5016D0C1806B0336737F0ABACCD3E3A1CEFFF44F004151D0505D8ECEF885559EA4A26D4304E4F",
    "publicKey": "CC6D788FC040DFA2987D69A8C2F78AC70E06B0B747003F8158DB146104EB894F6B75AA1531E1B813148EBDF1E0DB3AF409C8B1D7EB8B1C6C23C6B61EF75E262B"
    }
```
- EXPECTED RESPONSE:
```
{
  "isValid": true
}
```

#### Examples:
##### GET
`curl -X GET http://localhost:5000/health`
##### POST
```
curl -X POST http://localhost:5000/verify \
     -H "Content-Type: application/json" \
     -d '{"message": "{\"sensor_reading\":33,\"timestamp\":1719421407}", "signature": "0677F7B08D36FB1CBC37A08797A0A959C1C865154D3E3392DCA5016D0C1806B0336737F0ABACCD3E3A1CEFFF44F004151D0505D8ECEF885559EA4A26D4304E4F", "publicKey": "CC6D788FC040DFA2987D69A8C2F78AC70E06B0B747003F8158DB146104EB894F6B75AA1531E1B813148EBDF1E0DB3AF409C8B1D7EB8B1C6C23C6B61EF75E262B"}'

```

OD TU NAPREJ JE GENERIC README

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
