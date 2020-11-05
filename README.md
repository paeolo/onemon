# Welcome to onemon 👋
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> A CLI to help you share a deamon between your scripts

## Install

```sh
yarn add global onemon
```

## Usage

```sh
onemon [deamon-script] <script>
```
## How it works?

### The only deamon

- onemon look for a package.json containing your deamon-script, using find-up.
- onemon starts it as a deamon, if it's not already started.
- onemon attach to a socket opened by the deamon, so you can watch your deamon output.
- onemon look for a package.json containing your script, using find-up.
- onemon starts your script.
- when no script using `onemon deamon-script` is running, onemon kill your one deamon.

### Use case

Imagine you have a big monorepo and you want a bundler to watch for any changes.

- Create a script for your bundler on your top-level package.json, say `bundler:watch`.
- Create a script for each of your packages, say `dev`.
- You can now run `onemon bundler:watch dev` anywhere, multiple times.
- You may also run `onemon bundler:watch` if you just want to run the deamon.
- You will always have on deamon: onemon.

## Author

👤 **Paul Le Couteur**

