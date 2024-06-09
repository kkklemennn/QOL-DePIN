import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const app = express();
const port = 5050;

const execPromise = promisify(exec);

// Middleware to parse JSON bodies
app.use(express.json());

interface HardhatRequest {
  deviceid?: string;
  address?: string;
  userid?: string;
}

async function runHardhatTask(task: string, args: string[] = [], network: string = 'testnet'): Promise<string> {
  const command = `npx hardhat ${task} ${args.join(' ')} --network ${network}`;
  try {
    const { stdout, stderr } = await execPromise(command, { cwd: '/home/magbtcdev/mag-iotex/blockchain' });
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    return stdout;
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    throw error;
  }
}

// Endpoint to get device status
app.post('/device-status', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('device-status', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to run hello-world task
app.get('/hello-world', async (req: Request, res: Response) => {
  try {
    const result = await runHardhatTask('hello-world');
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to check balance
app.post('/check-balance', async (req: Request, res: Response) => {
  const { address } = req.body as HardhatRequest;
  if (!address) {
    return res.status(400).send("address is required");
  }
  try {
    const result = await runHardhatTask('check-balance', [`--address ${address}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to check decimals
app.get('/check-decimals', async (req: Request, res: Response) => {
  try {
    const result = await runHardhatTask('check-decimals');
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to activate device
app.post('/activate-device', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('activate-device', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to bind device
app.post('/bind-device', async (req: Request, res: Response) => {
  const { deviceid, userid } = req.body as HardhatRequest;
  if (!deviceid || !userid) {
    return res.status(400).send("deviceid and userid are required");
  }
  try {
    const result = await runHardhatTask('bind-device', [`--deviceid ${deviceid}`, `--userid ${userid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to register device
app.post('/register-device', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('register-device', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to remove device
app.post('/remove-device', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('remove-device', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to suspend device
app.post('/suspend-device', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('suspend-device', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to unbind device
app.post('/unbind-device', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('unbind-device', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to add ERC20 minter
app.post('/add-erc20-minter', async (req: Request, res: Response) => {
  const { address } = req.body as HardhatRequest;
  if (!address) {
    return res.status(400).send("address is required");
  }
  try {
    const result = await runHardhatTask('add-erc20-minter', [`--address ${address}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to check minter role
app.post('/check-minter-role', async (req: Request, res: Response) => {
  const { address } = req.body as HardhatRequest;
  if (!address) {
    return res.status(400).send("address is required");
  }
  try {
    const result = await runHardhatTask('check-minter-role', [`--address ${address}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to remove ERC20 minter
app.post('/remove-erc20-minter', async (req: Request, res: Response) => {
  const { address } = req.body as HardhatRequest;
  if (!address) {
    return res.status(400).send("address is required");
  }
  try {
    const result = await runHardhatTask('remove-erc20-minter', [`--address ${address}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to get device owner
app.post('/get-device-owner', async (req: Request, res: Response) => {
  const { deviceid } = req.body as HardhatRequest;
  if (!deviceid) {
    return res.status(400).send("deviceid is required");
  }
  try {
    const result = await runHardhatTask('get-device-owner', [`--deviceid ${deviceid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Endpoint to get owner devices
app.post('/get-owner-devices', async (req: Request, res: Response) => {
  const { userid } = req.body as HardhatRequest;
  if (!userid) {
    return res.status(400).send("userid is required");
  }
  try {
    const result = await runHardhatTask('get-owner-devices', [`--userid ${userid}`]);
    res.send(result);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

app.listen(port, () => {
  console.log(`Hardhat API server running at http://localhost:${port}`);
});
