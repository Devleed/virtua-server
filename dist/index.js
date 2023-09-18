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
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const data_json_1 = __importDefault(require("./data.json"));
const cors = require('cors');
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(cors());
function githubTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.github.com/repos/Uniswap/extended-token-list/contents/src/tokens/mainnet.json`;
        const { data } = yield axios_1.default.get(url, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });
        if (data && data.download_url) {
            const { data: tokens } = yield axios_1.default.get(data.download_url);
            if (tokens && tokens.length) {
                const convertedObject = tokens.reduce((result, item) => {
                    result[item.address.toLowerCase()] = item;
                    return result;
                }, {});
                (0, fs_1.writeFile)('data.json', JSON.stringify(convertedObject), err => {
                    if (err) {
                        console.error('Error writing JSON file:', err);
                    }
                    else {
                        console.log('JSON file saved successfully');
                    }
                });
            }
        }
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield githubTokens();
    res.send('RONIN POWERBACNK');
}));
app.get('/tokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.page) || '1';
    // Convert the structure into an array of key-value pairs
    const coinsArray = Object.entries(data_json_1.default);
    // Slice the first 10 items
    const first10Items = coinsArray.slice(0, parseInt(page) * 10);
    // If you want to convert it back to an object
    const result = first10Items.reduce((acc, [key, value]) => {
        acc[value.address] = value;
        return acc;
    }, {});
    res.send(result);
}));
app.get('/tokens/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const query = (_b = req.query) === null || _b === void 0 ? void 0 : _b.query;
    res.send(Object.values(data_json_1.default).filter(token => token.name.includes(query) ||
        token.symbol.includes(query)));
}));
app.get('/tokens/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = req.params.address;
    res.send(data_json_1.default[address.trim().toLowerCase()]);
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
