"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const utils_1 = require("./utils");
const path = require('path');
const activate = function (context) {
    const hoverHandler = vscode.languages.registerDefinitionProvider([
        { scheme: 'file', language: 'vue' },
        { scheme: 'file', language: 'scss' },
        { scheme: 'file', language: 'css' },
        { scheme: 'file', language: 'less' },
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'javascriptreact' }
    ], {
        provideDefinition(document, position, token) {
            const fileName = document.fileName; // 当前文件的绝对路径加文件名
            const workDir = path.dirname(fileName); // 当前文件的绝对路径
            const lineText = document.lineAt(position).text; // 当前行字符串
            const q = utils_1.screeningPath(lineText, position); // 路由别名目标路径
            const z = utils_1.rootPath(workDir, context); // 项目根目录
            const u = utils_1.screeningRelativePath(lineText, position); // 相对路径的目标路径
            let targetPath = ''; // 要跳转的目标路径
            let isPathInterior = false;
            let target = q;
            if (q && z) {
                targetPath = path.resolve(z, q.path);
                isPathInterior = position.character >= q.columns[0] && position.character <= q.columns[1];
            }
            else if (u) {
                targetPath = path.resolve(workDir, u.text);
                isPathInterior = position.character >= u.columns[0] && position.character <= u.columns[1];
                target = u;
            }
            const k = utils_1.joiningSuffix(targetPath); // 文件存在就返回目标文件，不存在就返回空字符串
            if (!k || !isPathInterior)
                return;
            return [
                {
                    originSelectionRange: target.rang,
                    targetRange: new vscode.Range(0, 0, 0, 0),
                    // targetSelectionRange: new vscode.Range(0,0,0,10),
                    targetUri: vscode.Uri.file(k)
                }
            ];
        },
    });
    context.subscriptions.push(hoverHandler);
};
exports.activate = activate;
const deactivate = function () {
};
exports.deactivate = deactivate;
