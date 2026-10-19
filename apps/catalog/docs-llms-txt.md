# LLMs.txt

Files that let AI coding assistants read the Aurea documentation.

Aurea publishes its documentation in the [llms.txt](https://llmstxt.org/) format, so an AI coding assistant can read it directly.

## Available files

- [llms.txt](https://aureauds.dev/llms.txt): the index. One line per page, with a link to the page as Markdown.
- [llms-full.txt](https://aureauds.dev/llms-full.txt): the whole documentation in one file. It holds the Getting Started pages, every component, every hook, the patterns, the blocks and the recipes.
- [aurea-agents.md](https://aureauds.dev/aurea-agents.md): short rules for AI coding agents. See [AGENTS.md](./docs-agents-md.html).

Every page of this site is also Markdown, next to its HTML: change `.html` to `.md` in the address. The "View as Markdown" item, in the menu next to "Copy Markdown", opens it.

## Integration

Most assistants can read documentation from an address. Give it the index:

```bash
https://aureauds.dev/llms.txt
```

For a tool that loads a whole file into its context, give it the full text:

```bash
https://aureauds.dev/llms-full.txt
```

The full file is large. When the context window is small, give the index, and let the assistant open only the pages it needs.

The "Copy Prompt" button at the top of every page copies a ready setup text: it tells the assistant to install the [Aurea skill](./docs-agent-skills.html) and to read the index.

## Contributing

Found an answer from an assistant that the documentation got wrong? [Open an issue](https://github.com/victor1mor/aurea-uds/issues) with the page and the question.
