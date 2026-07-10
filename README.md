# create-core2code

Scaffold a new project pre-loaded with the **Core2Code** engineering framework —
an engineering operating system for building production-grade applications.

```bash
npx create-core2code nutrition-app
```

That creates a `nutrition-app/` directory containing the full Core2Code
framework (foundation, discovery, architecture, engineering, security, quality,
delivery, operations, playbooks, checklists, templates), a generated project
README, a `.gitignore`, and an initialized git repository.

## Usage

```
create-core2code <project-name> [options]

Arguments:
  project-name       name of the project to create

Options:
  --no-git           skip git repository initialization
  -f, --force        overwrite the target directory if it already exists
  -v, --version      output the version number
  -h, --help         display help
```

## Development

```bash
npm install
npm run build      # compile TypeScript to dist/
npm test           # run the vitest suite
npm run typecheck  # type-check without emitting
```

Set `CORE2CODE_DEBUG=1` to print stack traces on unexpected errors.

## License

Apache-2.0
