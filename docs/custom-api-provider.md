# Custom API Provider (TrollLLM & OpenAI-Compatible APIs)

This guide explains how to use custom API endpoints like TrollLLM or other OpenAI-compatible APIs with claude-code-action.

## Quick Start

### Using in GitHub Actions Workflow

```yaml
name: Claude with Custom API
on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          # Custom API configuration
          custom_api_base_url: "https://chat.trollllm.xyz"
          custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}

          # Optional: specify model
          claude_args: |
            --model claude-3-5-sonnet-20241022
```

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add your API key:
   - Name: `TROLLLLM_API_KEY`
   - Value: `sk-trollllm-754ca2f4c0cca514b23db111894c2bd2351b225ea5388268992d3b989722fbc4`

## Configuration Options

| Input | Description | Required |
|-------|-------------|----------|
| `custom_api_base_url` | Custom API endpoint URL (e.g., `https://chat.trollllm.xyz`) | No |
| `custom_api_key` | API key for the custom endpoint | No |

## Examples

### Example 1: Basic TrollLLM Setup

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    custom_api_base_url: "https://chat.trollllm.xyz"
    custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}
```

### Example 2: With Custom Model and Max Turns

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    custom_api_base_url: "https://chat.trollllm.xyz"
    custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}
    claude_args: |
      --model claude-3-5-sonnet-20241022
      --max-turns 10
```

### Example 3: PR Review with Custom API

```yaml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          custom_api_base_url: "https://chat.trollllm.xyz"
          custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}
          prompt: |
            Review this pull request and provide feedback on:
            - Code quality
            - Potential bugs
            - Performance issues
            - Security concerns
```

### Example 4: Issue Triage with Custom API

```yaml
name: Claude Issue Triage
on:
  issues:
    types: [opened, labeled]

permissions:
  contents: read
  issues: write

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          custom_api_base_url: "https://chat.trollllm.xyz"
          custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}
          prompt: |
            Analyze this issue and:
            - Suggest appropriate labels
            - Estimate complexity
            - Recommend priority
```

## Complete Workflow Example

Save this as `.github/workflows/claude.yml`:

```yaml
name: Claude Code Assistant

on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]
  issues:
    types: [opened, labeled, assigned]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  claude:
    runs-on: ubuntu-latest
    # Only run for comments containing @claude
    if: |
      github.event_name != 'issue_comment' ||
      contains(github.event.comment.body, '@claude')
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Code Action
        uses: anthropics/claude-code-action@v1
        with:
          # TrollLLM API configuration
          custom_api_base_url: "https://chat.trollllm.xyz"
          custom_api_key: ${{ secrets.TROLLLLM_API_KEY }}

          # Optional settings
          trigger_phrase: "@claude"
          show_full_output: "false"

          # Claude CLI arguments
          claude_args: |
            --model claude-3-5-sonnet-20241022
            --max-turns 15
```

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly set in repository secrets
- Check that the API key has the necessary permissions

### Connection Issues
- Verify the API endpoint URL is correct
- Check if the API service is accessible from GitHub Actions runners

### Model Not Found
- Use `--model` in `claude_args` to specify the correct model name
- Check the API provider's documentation for available models

## Notes

- The `custom_api_key` takes precedence over `anthropic_api_key` if both are provided
- The `custom_api_base_url` takes precedence over `ANTHROPIC_BASE_URL` environment variable
- Make sure your custom API is compatible with Anthropic's API format
