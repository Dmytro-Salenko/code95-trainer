# Contributing to Driver95

Thank you for your interest in Driver95.

At this stage the project is in active MVP development. External contributions are welcome for bug reports and factual question corrections.

## Reporting Bugs

Open an [issue](https://github.com/dmytro-salenko/code95-trainer/issues) with:
- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Browser and OS

## Question Corrections

If a question or answer in the database is factually incorrect, please open an issue with:
- Question ID (visible in the URL or console)
- The incorrect content
- The correct content with a source reference (official Code 95 documentation)

## Code Changes

For now, please open an issue before submitting a pull request so we can discuss the change first.

When submitting a PR:
- Keep changes focused — one concern per PR
- Do not change `data.js` without a factual source
- Do not add new dependencies without discussion
- Follow the existing code style (vanilla JS, no frameworks)
- Do not add analytics instrumentation without prior agreement

## Sensitive Data

Never commit `.env`, `analytics.db`, or any file containing real credentials or personal data.
