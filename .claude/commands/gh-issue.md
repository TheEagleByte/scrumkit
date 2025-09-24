# Build/Fix GitHub Issue Command

This command is used to analyze and solve the GitHub issues in the project. It requires a valid issue number or URL as an argument.

Please analyze and build/fix the GitHub issue: $ARGUMENTS.

Follow these steps:

- Use gh issue view to get the issue details
- Understand the problem described in the issue
- Search the codebase for relevant files
- Implement the necessary changes to fix the issue
- Use a branch name that follows the format `issue-<issue-number>-<short-description>` for the changes
- Make sure to commit often with clear commit messages so you can track your progress and revert if necessary.
- Create a descriptive commit message
- Create a pull request with the changes
- If the issue is a bug, ensure to test the fix thoroughly
- If the issue is a feature request, ensure to implement it according to the specifications
- Before creating the pull request, ensure to run any linters, formatters, builds, and tests to validate your changes
- Review any existing documentation and update it or add to it if necessary to reflect the changes made
- Update the CHANGELOG.md file if the changes are notable and should be documented
- After the work is complete and the pull request is created, do a self-review of the code changes to ensure quality and adherence to project standards.
- After the pull request is reviewed, address any feedback and ensure that all the pipelines pass before finishing the task.

## Execution Guidelines

- If the issue requires clarification, ask for more details in the issue comments and wait for a response before proceeding.
- If the issue is a bug, ensure to reproduce the bug before attempting to fix it.
- Ensure to follow the project's coding standards and conventions
- Remember to use the GitHub CLI (gh) for all GitHub-related tasks.
- If the task is able to be broken down into parallel tasks, do so to speed up the process utilizing sub agents to complete the tasks in parallel.
- Before embarking on a task, make sure to read the issue description thoroughly and understand the requirements, come up with a plan to solve the issue, and utilize sequential-thinking mcp server to break down the task into smaller manageable parts if necessary.
- If you need to reference up-to-date code examples and documentation, use the context7 mcp server.
- If you need to check the UI for changes you have made, use the playwright mcp server to access the UI through a browser.
- If you need to talk with stripe, use the stripe mcp server to access the stripe API.
- If you need to talk with supabase, use the supabase mcp server to access the supabase API.
- If you need to commit your code, use the `/commit` command and do not include the Co-authored by Claude Code part.
- If you need to create a pull request, ensure to reference the issue number in the pull request description.
- Make sure to test and validate your changes before creating the pull request.
- Make sure to run any linters, formatters, builds, and tests before committing your code.
- Make sure to self-review your code before creating the pull request.
- Make sure the pipelines pass before finishing the task.