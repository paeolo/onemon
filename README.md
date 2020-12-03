# Welcome to onemon 👋
![Version](https://img.shields.io/badge/version-1.2.2-red.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> A CLI to help you share a deamon between your scripts

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

## Author

👤 **Paul Le Couteur**
