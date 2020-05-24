#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spawn = require('cross-spawn').spawn;
var envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;
var string_argv_1 = require("string-argv");
function parseCommand(args) {
    var command = null;
    var commandArgs = [];
    for (var i = 0; i < args.length; i++) {
        var cStart = [];
        cStart = args
            .slice(i)
            .map(function (a) {
            var re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g;
            return a.replace(re, function (m) {
                if (m === '\\\\')
                    return '\\';
                if (m === "\\'")
                    return "'";
                return '';
            });
        });
        command = cStart[0];
        commandArgs = cStart.slice(1);
        break;
    }
    console.log(command);
    return [command, commandArgs];
}
function makeDeploy(args) {
    var _a = parseCommand(args), command = _a[0], commandArgs = _a[1];
    if (command) {
        var proc_1 = spawn(command, commandArgs, {
            stdio: 'inherit',
        });
        process.on('SIGTERM', function () { return proc_1.kill('SIGTERM'); });
        process.on('SIGINT', function () { return proc_1.kill('SIGINT'); });
        process.on('SIGBREAK', function () { return proc_1.kill('SIGBREAK'); });
        process.on('SIGHUP', function () { return proc_1.kill('SIGHUP'); });
        proc_1.on('exit', function (code, signal) {
            var crossEnvExitCode = code;
            if (crossEnvExitCode === null) {
                crossEnvExitCode = signal === 'SIGINT' ? 0 : 1;
            }
            process.exit(crossEnvExitCode);
        });
        return proc_1;
    }
    return null;
}
var main = function () {
    var args = string_argv_1.default(process.argv.join(' '));
    console.log(args);
};
main();
