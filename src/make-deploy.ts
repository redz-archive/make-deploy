#!/usr/bin/env node
const { spawn } = require('cross-spawn');
const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;
import stringArgv from 'string-argv';

function parseCommand(args: string[]) {
  let command = null;
  let commandArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    // No more env setters, the rest of the line must be the command and args
    let cStart = [];
    cStart = args
      .slice(i)
      // Regex:
      // match "\'" or "'"
      // or match "\" if followed by [$"\] (lookahead)
      .map((a) => {
        const re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g;
        // Eliminate all matches except for "\'" => "'"
        return a.replace(re, (m) => {
          if (m === '\\\\') return '\\';
          if (m === "\\'") return "'";
          return '';
        });
      });
    command = cStart[0];
    commandArgs = cStart.slice(1);
    break;
  }

  // console.log(args);
  console.log(command);
  // console.log(commandArgs);

  return [command, commandArgs];
}

// crossEnv(process.argv.slice(2), {shell: true})
function makeDeploy(args: string[]) {
  const [command, commandArgs] = parseCommand(args);

  if (command) {
    const proc = spawn(
      // run `path.normalize` for command(on windows)
      command,
      // by default normalize is `false`, so not run for cmd args
      commandArgs,
      {
        stdio: 'inherit',
      }
    );
    process.on('SIGTERM', () => proc.kill('SIGTERM'));
    process.on('SIGINT', () => proc.kill('SIGINT'));
    process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
    process.on('SIGHUP', () => proc.kill('SIGHUP'));
    proc.on('exit', (code: number, signal: string) => {
      let crossEnvExitCode = code;
      // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
      // but if the signal is SIGINT the user exited the process so we want exit code 0
      if (crossEnvExitCode === null) {
        crossEnvExitCode = signal === 'SIGINT' ? 0 : 1;
      }
      process.exit(crossEnvExitCode); //eslint-disable-line no-process-exit
    });
    return proc;
  }
  return null;
}

const main = () => {
  const args = stringArgv(process.argv.join(' '));
  console.log(args);

  // makeDeploy(process.argv.slice(2));

  // console.log(
  //   parseCommand(
  //     'cross-env NODE_ENV=production webpack-dev-server --history-api-fallback --hot --config config/webpack/dev.config.js1'
  //   )
  // );
};

main();
