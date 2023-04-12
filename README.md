# SML Slang

Standard ML sublanguage

## Possible Issues (and manual solutions)

* `node` should be replaced by `node.exe` if you are using WSL with node.js installed on your Windows, you can update relevant scripts used in `package.json`.
* In case you meet the same error as [this](https://github.com/jiangmiao/node-getopt/issues/20) when using *node-getopt*, modify the `package.json` of node-getopt as [this PR](https://github.com/jiangmiao/node-getopt/pull/21/commits/05e498731c14b648fa332ca78d3a301c5e4be440) shows.

# Table of Contents

- [Requirements](#requirements)
- [Using sml-slang with Local Frontend](#using-sml-slang-with-your-local-frontend)
- [Command Line Usage](#usage)
- [Testing](#testing)

# Requirements

- node: known working version: v16.14.0

# Using sml-slang with your local frontend

A common issue when developing modifications to sml-slang is how to test it using your own local frontend. We have provided a simple frontend [here](https://github.com/sheehui/sml-frontend) to get you started.

First, build and link your local sml-slang:

```{.}
$ git clone https://github.com/sheehui/sml-slang
$ cd sml-slang
$ yarn
$ yarn build
$ yarn link
```

Then, from your local copy of frontend:

```{.}
$ git clone https://github.com/sheehui/sml-frontend
$ cd sml-frontend
$ yarn link sml-slang
```

Then start the frontend and the new sml-slang will be used.

```{.}
$ cd sml-frontend
$ npm install
$ npm start
```

# Command Line Usage 

To build,

```{.}
$ git clone https://github.com/sheehui/sml-slang
$ cd sml-slang
$ yarn
$ yarn build
```

To try out _SML Slang_ in a REPL, run

```{.}
$ yarn repl ''
```

Hint: In `bash` you can take the `PROGRAM_STRING` out of a file as follows:

```{.}
$ yarn repl -e "$(< my_source_program.ts)"
```

# Testing

`sml-slang` comes with an extensive test suite which can be found in `src/tests`. To run the tests after you made your modifications, run:
```{.}
$ yarn test
```