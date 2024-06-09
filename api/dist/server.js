"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const app = (0, express_1.default)();
const port = 5050;
const execPromise = (0, util_1.promisify)(child_process_1.exec);
// Middleware to parse JSON bodies
app.use(express_1.default.json());
function runHardhatTask(task_1) {
    return __awaiter(this, arguments, void 0, function* (task, args = [], network = 'testnet') {
        const command = `npx hardhat ${task} ${args.join(' ')} --network ${network}`;
        try {
            const { stdout, stderr } = yield execPromise(command, { cwd: '/home/magbtcdev/mag-iotex/blockchain' });
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            return stdout;
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
            throw error;
        }
    });
}
// Endpoint to get device status
app.post('/device-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('device-status', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to run hello-world task
app.get('/hello-world', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield runHardhatTask('hello-world');
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to check balance
app.post('/check-balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    if (!address) {
        return res.status(400).send("address is required");
    }
    try {
        const result = yield runHardhatTask('check-balance', [`--address ${address}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to check decimals
app.get('/check-decimals', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield runHardhatTask('check-decimals');
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to activate device
app.post('/activate-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('activate-device', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to bind device
app.post('/bind-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid, userid } = req.body;
    if (!deviceid || !userid) {
        return res.status(400).send("deviceid and userid are required");
    }
    try {
        const result = yield runHardhatTask('bind-device', [`--deviceid ${deviceid}`, `--userid ${userid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to register device
app.post('/register-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('register-device', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to remove device
app.post('/remove-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('remove-device', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to suspend device
app.post('/suspend-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('suspend-device', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to unbind device
app.post('/unbind-device', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('unbind-device', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to add ERC20 minter
app.post('/add-erc20-minter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    if (!address) {
        return res.status(400).send("address is required");
    }
    try {
        const result = yield runHardhatTask('add-erc20-minter', [`--address ${address}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to check minter role
app.post('/check-minter-role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    if (!address) {
        return res.status(400).send("address is required");
    }
    try {
        const result = yield runHardhatTask('check-minter-role', [`--address ${address}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to remove ERC20 minter
app.post('/remove-erc20-minter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    if (!address) {
        return res.status(400).send("address is required");
    }
    try {
        const result = yield runHardhatTask('remove-erc20-minter', [`--address ${address}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to get device owner
app.post('/get-device-owner', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceid } = req.body;
    if (!deviceid) {
        return res.status(400).send("deviceid is required");
    }
    try {
        const result = yield runHardhatTask('get-device-owner', [`--deviceid ${deviceid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Endpoint to get owner devices
app.post('/get-owner-devices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid } = req.body;
    if (!userid) {
        return res.status(400).send("userid is required");
    }
    try {
        const result = yield runHardhatTask('get-owner-devices', [`--userid ${userid}`]);
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
app.listen(port, () => {
    console.log(`Hardhat API server running at http://localhost:${port}`);
});
