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
exports.screeningRelativePath = exports.joiningSuffix = exports.rootPath = exports.screeningPath = void 0;
const vscode = __importStar(require("vscode"));
const fs = require('fs');
const path = require('path');
const { mappings, rootpath: rootfile, allowedsuffix, } = vscode.workspace.getConfiguration().get('smart-jump');
/**
 * 从文本中过滤出路径
 * @param {string} rawLineText 包含路径的字符串
 * @param {vscode.Position} position 位置
 * @returns 目标路径
 */
const screeningPath = function (rawLineText, position) {
    // 移除异步路由中的注释, 移除以下/**/内容
    // e.g. component: () => import(/* webpackChunkName: "test" */ '@/views/test-func/index.vue')
    const removedCommentText = rawLineText.replace(/\/\*.*\*\//g, '');
    let findAlias = '';
    for (const key in mappings) {
        if (removedCommentText.includes(key)) {
            findAlias = key;
        }
    }
    if (!findAlias) {
        return '';
    }
    const lineTextMatch = removedCommentText.match(new RegExp(`${findAlias}([^'"]*)`, 'g'));
    if (Array.isArray(lineTextMatch) && lineTextMatch.length > 0) {
        const lineText = lineTextMatch[0];
        let text = lineTextMatch[0];
        const i = lineText.indexOf(text);
        const columns = [
            i,
            i + text.length + (rawLineText.length - lineText.length),
        ];
        let [key, ...m] = text.split('/');
        // 判断配置的别名是否斜杠开始
        const isStartsWithSlash = text.startsWith('/');
        const guessAlias = isStartsWithSlash ? '/' + m[0] : key;
        if (mappings.hasOwnProperty(guessAlias)) {
            let e = mappings[guessAlias];
            if (e[0] === '/') {
                e = e.substring(1);
            }
            if (isStartsWithSlash) {
                m.shift();
            }
            return {
                path: path.join(e, ...m),
                rang: new vscode.Range(position.line, columns[0], position.line, columns[1]),
                columns,
            };
        }
    }
    return '';
};
exports.screeningPath = screeningPath;
/**
 * 通过当前文件的绝对路径和配置的根文件解析出根目录，并储存已获取的项目根目录
 * @param {*} presentPath 当前文件路径
 * @param {*} context 当前上下文对象
 * @returns 输出根目录
 */
const rootPath = function (presentPath, context) {
    const memento = context.workspaceState;
    let rootList = memento.get('rootList', []);
    for (const item of rootList) {
        if (presentPath.indexOf(item) === 0) {
            return item;
        }
    }
    let arr = presentPath.split(path.sep);
    let len = arr.length;
    let base = '';
    for (let index = 0; index < len; index++) {
        let z = fs.existsSync(path.join(process.platform === 'win32' ? '' : '/', ...arr, rootfile));
        if (z) {
            base = path.join(process.platform === 'win32' ? '' : '/', ...arr);
            memento.update('rootList', [...rootList, base]);
            return base;
        }
        else {
            arr.pop();
        }
    }
    return base;
};
exports.rootPath = rootPath;
/**
 * 通过目标的路径拼接后缀并验证该文件存在
 * @param {*} targetPath 目标路径
 * @returns 拼接上后缀名并返回
 */
const joiningSuffix = function (targetPath) {
    const extname = path.extname(targetPath);
    if (!extname) {
        for (const item of allowedsuffix) {
            if (fs.existsSync(`${targetPath}.${item}`)) {
                return `${targetPath}.${item}`;
            }
        }
        targetPath = path.join(targetPath, 'index');
        for (const item of allowedsuffix) {
            if (fs.existsSync(`${targetPath}.${item}`)) {
                return `${targetPath}.${item}`;
            }
        }
    }
    else if (fs.existsSync(targetPath)) {
        return targetPath;
    }
    else {
        return '';
    }
};
exports.joiningSuffix = joiningSuffix;
/**
 * 从文本中过滤出相对路径
 * @param {string} linetext 包含路径的字符串
 * @returns 目标路径的相对路径
 */
const screeningRelativePath = function (linetext, position) {
    let arr = linetext.match(/('.+')|(".+")/); // 正则匹配
    let text = '';
    if (arr) {
        text = arr[0].substring(1, arr[0].length - 1);
        const i = linetext.indexOf(text);
        const columns = [i, i + text.length];
        return {
            text,
            rang: new vscode.Range(position.line, columns[0], position.line, columns[1]),
            columns,
        };
    }
    return '';
};
exports.screeningRelativePath = screeningRelativePath;
