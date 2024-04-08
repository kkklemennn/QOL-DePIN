var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Simulator } from "@w3bstream/w3bstream-http-client-simulator";
import dataGenerator from "./generator";
import config from "./config";
const { PUB_TOKEN, W3BSTREAM_ENDPOINT } = config;
const MSG_INTERVAL_SEC = 10;
const simulator = new Simulator(PUB_TOKEN, W3BSTREAM_ENDPOINT);
simulator.init();
simulator.dataPointGenerator = dataGenerator;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Starting simulator");
            simulator.powerOn(MSG_INTERVAL_SEC);
        }
        catch (error) {
            console.log(error);
        }
    });
}
start();
