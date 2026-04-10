"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var fs_1 = require("fs");
var multer_1 = require("multer");
var autoload_1 = require("./src/autoload");
var chat_1 = require("./src/chat");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
var CONFIG_PATH = path_1.default.join(process.cwd(), 'src', 'config.json');
var config = {};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use('/src', express_1.default.static(path_1.default.join(process.cwd(), 'src')));
app.get('/config', function (req, res) {
    var _a;
    try {
        var latest = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
        res.json(__assign({ creator: latest.settings.creator }, latest));
    }
    catch (err) {
        res.status(500).json({ creator: ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.creator) || 'Arvi', error: 'Internal Server Error' });
    }
});
app.get('/api', function (req, res) {
    try {
        var latest = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
        res.json({ status: true, creator: latest.settings.creator, apiName: latest.settings.apiName, description: latest.settings.description, version: latest.settings.apiVersion, endpoints: latest.tags });
    }
    catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});
app.get('/', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html')); });
app.get('/docs', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'docs.html')); });
app.get('/blog', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'blog.html')); });
app.get('/chat', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'publicchat.html')); });
var _upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
var _files = new Map();
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, _a = _files.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], f = _b[1];
        if (now > f.expiresAt)
            _files.delete(id);
    }
}, 60 * 1000);
app.post('/upload', _upload.single('file'), function (req, res) {
    var file = req.file;
    if (!file)
        return res.status(400).json({ status: false, message: 'No file uploaded' });
    var id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    var expiresAt = Date.now() + 5 * 60 * 1000;
    _files.set(id, { filename: file.originalname, mimetype: file.mimetype, data: file.buffer, expiresAt: expiresAt });
    setTimeout(function () { return _files.delete(id); }, 5 * 60 * 1000);
    var url = req.protocol + '://' + req.get('host') + '/f/' + id;
    res.json({ status: true, url: url, expires_in: '5 minutes' });
});
app.get('/f/:id', function (req, res) {
    var f = _files.get(req.params.id);
    if (!f || Date.now() > f.expiresAt) {
        return res.status(404).json({ status: false, message: 'File tidak ditemukan atau sudah kadaluarsa' });
    }
    res.setHeader('Content-Type', f.mimetype);
    res.setHeader('Content-Disposition', 'inline; filename="' + f.filename + '"');
    res.send(f.data);
});
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                config = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
                (0, autoload_1.loadRouter)(app, config);
                (0, chat_1.registerChatRoutes)(app);
                (0, autoload_1.initAutoLoad)(app, config, CONFIG_PATH);
                app.use(function (req, res) {
                    var p404 = path_1.default.join(process.cwd(), 'public', '404.html');
                    if (fs_1.default.existsSync(p404))
                        return res.status(404).sendFile(p404);
                    res.status(404).json({ status: false, message: 'Not Found' });
                });
                app.listen(PORT, function () { console.log('[✓] Server running on port ' + PORT); });
            }
            catch (err) {
                console.error('[ㄨ] Failed to start server:', err.message);
                process.exit(1);
            }
            return [2 /*return*/];
        });
    });
}
startServer();
