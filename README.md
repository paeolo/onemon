# Welcome to onemon 👋
![Version](https://img.shields.io/badge/version-1.2.2-red.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> A CLI to help you share a deamon between your scripts

Onemon has been created to fill a gap in the complex tooling world of javascript. When you have a monorepo, you may want to share a watcher between all your processes.

 Of course you can do this by creating a vscode task like one that will launch `tsc --watch` in the background but maybe you want something more generic: a task that will launch both an instance of the watcher and your process in the same process.

The problem is if you launch two tasks, you don't want two watchers, so here onemon will help you, it will launch only one deamon and share it between your processes by using sockets to output its stdout.

## Install

```sh
yarn global add onemon
```

## Usage

```sh
onemon [deamon-script] <script>
```
## How it works?

### The only deamon

- onemon starts your deamon-script as a deamon, if it's not already started.
- onemon attach to a socket opened by the deamon, so you can watch your deamon output.
- onemon starts your script if you provided one.
- when no script using `onemon deamon-script ...` is running, onemon kill your one deamon.

### What can be scripts?

- For the deamon, you can only use a .js file.
- For the script, you can either use a .js file, or a script entry from a package.json

### Flags

- --silent (-s) |> Don't attach to the deamon output.
- --wait (-w) |> Wait for the deamon to call notifyReady() before launching the script.

### Using it programmatically

The main function is exported so instead of using the CLI you can use onemon in your own code programmatically and we encourage you to do this.

## Author

👤 **Paul Le Couteur**
