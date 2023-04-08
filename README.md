# sml-slang

Sub language of Standard ML.

# Table of Contents

- [Requirements](#requirements)
- [Using sml-slang with Local Frontend (Recommended)](#using-sml-slang-with-your-local-frontend-recommended)
- [Command Line Usage](#usage)
- [Testing](#testing)

# Requirements

- node: known working version: v16.14.0

# Using sml-slang with your local frontend (Recommended)

A common issue when developing modifications to sml-slang is how to test it using your own local frontend. We have provided a simple frontend [here](https://github.com/sheehui/sml-frontend) to get you started.

First, build and link your local sml-slang:

```{.}
$ cd sml-slang
$ yarn build
$ yarn link
```

Then, from your local copy of frontend:

```{.}
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
$ yarn repl
```

You can set additional options:

```{.}
Usage: yarn repl [PROGRAM_STRING] [OPTION]
  -h, --help            display this help
  -e, --eval            don't show REPL, only display output of evaluation
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