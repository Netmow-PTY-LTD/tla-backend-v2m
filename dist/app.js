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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorhandler_1 = __importDefault(require("./app/middlewares/globalErrorhandler"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const routes_1 = __importDefault(require("./app/routes"));
const config_1 = __importDefault(require("./app/config"));
const upload_1 = require("./app/config/upload");
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: [`${config_1.default.client_url}`], credentials: true }));
app.post('/api/v1/upload', upload_1.upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const userId = req.body.userId;
        const userId = 'rrraaabbyy';
        const file = req.file;
        if (!file || !userId) {
            res.status(400).json({ message: 'Missing file or userId' });
            return;
        }
        const url = yield (0, upload_1.uploadToSpaces)(file.buffer, file.originalname, userId);
        res.status(200).json({ url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
}));
// application routes
app.use('/api/v1', routes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to Backend World');
});
app.use(globalErrorhandler_1.default);
//Not Found
app.use(notFound_1.default);
exports.default = app;
