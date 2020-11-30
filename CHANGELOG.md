# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2020-11-30

### Changed

- Print a "Notified ready" when launching deamon alone with wait flag.

## [1.2.1] - 2020-11-28

### Changed

- deamon-script should now be a .js file, it is launched with fork instead of spawn.
- script can either be a .js file or a script like before.
- support for windows.

## [1.1.6] - 2020-11-17

### Changed

- Minor fix.

## [1.1.5] - 2020-11-12

### Changed

- Uniformize colors.

## [1.1.4] - 2020-11-12

### Added

- Print message when script is launched.

### Changed

- bugfix. wait flag couldn't work with two scripts waiting.

## [1.1.3] - 2020-11-08

### Changed

- bugfix. use node IPC instead of fd for "DEAMON_READY".

## [1.1.2] - 2020-11-08

### WARNING
THIS VERSION IS BUGGED. PLEASE USE 1.1.3 INSTEAD.

### Changed

- bugfix. write "DEAMON_READY" in dedicated fd instead of stdout.

## [1.1.1] - 2020-11-07

### Changed

- minor improvement.

## [1.1.0] - 2020-11-07

### Changed

- onemon now exits if the script exit.

## [1.0.10] - 2020-11-07

### Added

- "--wait" flag added together with a "notifyReady" exported function.

## [1.0.9] - 2020-11-06

### Added

- use shell directly instead of "npm run".

## [1.0.8] - 2020-11-05

### Added

- fix issue when the socket is not closed properly.

## [1.0.7] - 2020-11-05

### Added

- "--silent" flag added.

## [1.0.6] - 2020-11-04

### Added

- Initial version of onemon CLI.
