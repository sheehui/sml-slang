# sml-slang

Calculator language modified from js-slang.

## Possible Issues (and manual solutions)

* If you failed to execute the `jsdoc.sh` in your bash
  * Delete the first line of jsdoc.sh (for Windows PowerShell) before executing `yarn jsdoc`.
  * Please modify the line break type if `‘bash\r’: No such file or directory`
* `node` should be replaced by `node.exe` if you are using WSL with node.js installed on your Windows.
* In case you meet the same error as [this](https://github.com/jiangmiao/node-getopt/issues/20) when using *node-getopt*, modify the `package.json` of node-getopt as [this PR](https://github.com/jiangmiao/node-getopt/pull/21/commits/05e498731c14b648fa332ca78d3a301c5e4be440) shows.

# Table of Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Documentation](#documentation)
- [Requirements](#requirements-1)
- [Testing](#testing)
- [Error messages](#error-messages)
- [Using your xx-slang in your local Source Academy](#using-your-xx-slang-in-your-local-source-academy)
- [Talks and Presentations](#talks-and-presentations)
- [License](#license)

# Requirements

- node: known working version: v16.14.0

# Usage

To build,

```{.}
$ git clone https://github.com/sheehui/sml-slang
$ cd sml-slang
$ yarn
$ yarn build
```

To add \"sml-slang\" to your PATH, build it as per the above instructions, then
run

```{.}
$ cd dist
$ npm link
```

If you do not wish to add \"sml-slang\" to your PATH, replace \"sml-slang\" with
\"node dist/repl/repl.js\" in the following examples.

To try out _Source_ in a REPL, run

```{.}
$ sml-slang -c [chapter] # default: 1
```

You can set additional options:

```{.}
Usage: sml-slang [PROGRAM_STRING] [OPTION]
  -h, --help            display this help
  -e, --eval            don't show REPL, only display output of evaluation
```

Currently, valid CHAPTER/VARIANT combinations are:

- `--chapter=1 --variant=calc`

Hint: In `bash` you can take the `PROGRAM_STRING` out of a file as follows:

```{.}
$ sml-slang -n -e "$(< my_source_program.ts)"
```

# Documentation

Source is documented here: [https://docs.sourceacademy.org/](https://docs.sourceacademy.org/)

# Requirements

- `bash`: known working version: GNU bash, version 5.0.16
- `latexmk`: Version 4.52c
- `pdflatex`: known working versions
  - pdfTeX 3.14159265-2.6-1.40.18 (TeX Live 2017)

To build the documentation, run

```{.}
$ git clone https://github.com/source-academy/sml-slang.git
$ cd sml-slang
$ yarn
$ yarn install
$ yarn jsdoc  # to make the web pages in sml-slang/docs/source
$ cd docs/specs
$ make        # to make the PDF documents using LaTeX
```

**Note**: The documentation may not build on Windows, depending on your bash setup,
[see above](https://github.com/source-academy/js-slang#requirements).

Documentation on the Source libraries are generated from inline documentation in
the library sources, a copy of which are kept in `docs/lib/*.js`. The command
`yarn jsdoc` generates the documentation and places it in the folder
`docs/source`. You can test the documentation using a local server:

```{.}
$ cd docs/source;  python -m http.server 8000
```

Documentation of libraries is displayed in autocomplete in the frontend. This
documentation is generated by `./scripts/updateAutocompleteDocs.py` and placed
in `src/editors/ace/docTooltip/*.json` files. This script is run by
`yarn build`prior to `tsc`. To add a Source variant to the frontend autocomplete,
edit `src/editors/ace/docTooltip/index.ts`
and `./scripts/updateAutocompleteDocs.py`.

# Testing

`js-slang` comes with an extensive test suite. To run the tests after you made
your modifications, run `yarn test`. Regression tests are run automatically when
you want to push changes to this repository. The regression tests are generated
using `jest` and stored as snapshots in `src/\_\_tests\_\_`. After modifying
`js-slang`, carefully inspect any failing regression tests reported in red in
the command line. If you are convinced that the regression tests and not your
changes are at fault, you can update the regression tests as follows:

```{.}
$ yarn test -- --updateSnapshot
```

# Error messages

To enable verbose messages, have the statement `"enable verbose";` as the first
line of your program. This also causes the program to be run by the interpreter.

There are two main kinds of error messages: those that occur at runtime and
those that occur at parse time. The first can be found in
`interpreter-errors.ts`, while the second can be found in `rules/`.

Each error subclass will have `explain()` and `elaborate()`. Displaying the
error will always cause the first to be called; the second is only called when
verbose mode is enabled. As such, `explain()` should be made to return a string
containing the most basic information about what the error entails. Any
additional details about the error message, including specifics and correction
guides, should be left to `elaborate()`.

Please remember to write test cases to reflect your added functionalities. The
god of this repository is self-professed to be very particular about test cases.

# Using your xx-slang in your local Source Academy

(xx is the name of your language)

A common issue when developing modifications to js-slang is how to test it using
your own local frontend. Assume that you have built your own frontend locally,
here is how you can make it use your own xx-slang, instead of the one that the
Source Academy team has deployed to npm.

First, build and link your local xx-slang: (don't forget to modify the "sml-slang" in both projects)

```{.}
$ cd xx-slang
$ yarn build
$ yarn link
```

Then, from your local copy of frontend:

```{.}
$ cd frontend
$ yarn link "xx-slang"
```

Then start the frontend and the new js-slang will be used.

# Talks and Presentations

- **How `js-slang` works under the hood** [17th Jan 2023][The
  Gathering][[slides](https://docs.google.com/presentation/d/1GFR39iznBZxWv948zUsmcbCSSDasm4xYs3Jc5GF7A3I/edit?usp=sharing)]

# License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
All sources in this repository are licensed under the
[Apache License Version 2][apache2].

[apache2]: https://www.apache.org/licenses/LICENSE-2.0.txt
