"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorhandler_1 = __importDefault(require("./app/middlewares/globalErrorhandler"));
const routes_1 = __importDefault(require("./app/routes"));
const apiNotFound_1 = __importDefault(require("./app/middlewares/apiNotFound"));
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// app.use(
//   cors({
//     origin: [`${config.client_url}`, 'http://localhost:3000'],
//     credentials: true,
//   }),
// );
app.use((0, cors_1.default)());
// application routes
app.use('/api/v1', routes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to TLA Backend World');
});
app.use(globalErrorhandler_1.default);
//Not Found
app.use(apiNotFound_1.default);
exports.default = app;
