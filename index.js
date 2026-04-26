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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var fs_1 = require("fs");
var multer_1 = require("multer");
var autoload_1 = require("./src/autoload");
var chat_1 = require("./src/chat");
// Auth modules loaded dynamically for JS compat
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
var CONFIG_PATH = path_1.default.join(process.cwd(), 'src', 'config.json');
var config = {};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use('/src', express_1.default.static(path_1.default.join(process.cwd(), 'src')));

// API key middleware
try {
    var mw = require('./src/middleware');
    if (mw && mw.apiKeyMiddleware) app.use(mw.apiKeyMiddleware);
} catch(e) { console.log('[~] Middleware not compiled, skipping:', e.message); }

// Original routes preserved
app.get('/config', function (req, res) {
    var _a;
    try {
        var latest = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
        var obj = Object.assign({ creator: latest.settings.creator }, latest);
        res.json(obj);
    } catch (err) {
        res.status(500).json({ creator: ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.creator) || 'ZFloryn-Z', error: 'Internal Server Error' });
    }
});
app.get('/api', function (req, res) {
    try {
        var latest = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
        res.json({ status: true, creator: latest.settings.creator, apiName: latest.settings.apiName, description: latest.settings.description, version: latest.settings.apiVersion, endpoints: latest.tags });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});
app.get('/', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html')); });
app.get('/docs', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'docs.html')); });
app.get('/pricing', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'pricing.html')); });
app.get('/login', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'login.html')); });
app.get('/register', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'register.html')); });
app.get('/dashboard', function (req, res) { res.sendFile(path_1.default.join(process.cwd(), 'public', 'dashboard.html')); });
app.get('/blog', function (req, res) {
    var p = path_1.default.join(process.cwd(), 'public', 'blog.html');
    if (fs_1.default.existsSync(p)) return res.sendFile(p);
    res.redirect('/');
});
app.get('/chat', function (req, res) {
    var p = path_1.default.join(process.cwd(), 'public', 'publicchat.html');
    if (fs_1.default.existsSync(p)) return res.sendFile(p);
    res.redirect('/');
});

var _upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
var _files = new Map();
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, _a = _files.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], f = _b[1];
        if (now > f.expiresAt) _files.delete(id);
    }
}, 60 * 1000);
app.post('/upload', _upload.single('file'), function (req, res) {
    var file = req.file;
    if (!file) return res.status(400).json({ status: false, message: 'No file uploaded' });
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
        return (function (_a) {
            var err;
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 1, , 2]);
                    config = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
                    (0, autoload_1.loadRouter)(app, config);
                    (0, chat_1.registerChatRoutes)(app);
                    (0, autoload_1.initAutoLoad)(app, config, CONFIG_PATH);
                    // Auth routes
                    try {
                        var authRoutes = require('./src/authRoutes');
                        if (authRoutes && authRoutes.registerAuthRoutes) authRoutes.registerAuthRoutes(app);
                        console.log('[✓] Auth routes loaded');
                    } catch(e) { console.log('[~] Auth routes not compiled yet, skipping'); }
                    // Ensure data files
                    var usersPath = path_1.default.join(process.cwd(), 'src', 'users.json');
                    var usagePath = path_1.default.join(process.cwd(), 'src', 'usage.json');
                    if (!fs_1.default.existsSync(usersPath)) fs_1.default.writeFileSync(usersPath, '[]');
                    if (!fs_1.default.existsSync(usagePath)) fs_1.default.writeFileSync(usagePath, '[]');
                    app.use(function (req, res) {
                        var p404 = path_1.default.join(process.cwd(), 'public', '404.html');
                        if (fs_1.default.existsSync(p404)) return res.status(404).sendFile(p404);
                        res.status(404).json({ status: false, message: 'Not Found' });
                    });
                    app.listen(PORT, function () {
                        console.log('[✓] ZFloryn API v2.0 running on port ' + PORT);
                    });
                    return [3, 2];
                case 1:
                    err = _a.sent();
                    console.error('[ㄨ] Failed to start server:', err.message);
                    process.exit(1);
                    return [3, 2];
                case 2: return [2];
            }
        })({label:0,sent:function(){},trys:[],ops:[]});
    });
}
startServer();
