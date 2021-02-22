# Google Hash Code Parctice 2021

TypeScript solution for Google Hash Code 2021 practice round.

## Set up your environment

- Install Deno by following [these instructions](https://deno.land/manual/getting_started/installation).
- Install the official [Deno VSCode extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

## Usage

In the project directory, you can run:

### `deno run --unstable --allow-read=input,src/solvers --allow-write=submission src/main.ts input/*`

Runs the main program with all the input files.

If you want to run only specific files, you can specify them as last arguments of the command:

```bash
deno run --unstable --allow-read=input --allow-write=submission src/main.ts input/a_example input/b_little_bit_of_everything.in
```

**Note:** You can also allow all permissions with `deno run --unstable -A src/main.ts input/*`

### `deno test --allow-read=input`

Runs all tests in the current directory and all sub-directories.

**Note:** You can also allow all permissions with `deno test -A`

### `deno fmt`

Formats all TypeScript files in the current directory and all sub-directories.
