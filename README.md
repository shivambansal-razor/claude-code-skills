# Claude Code Skills - Dashboard Update

A collection of Claude Code skills for creating and managing personalized project dashboards with DevRev data.

## Overview

This repository provides a reusable skill that enables team members to create personalized project tracking dashboards. Each team member can use their own Vista views, project IDs, and email recipients without modifying shared code.

## What's Included

- **Dashboard Update Skill** (`/dashboard-update`) - Interactive skill for creating and updating dashboards
- **Parameterized Fetch Script** - Flexible script that accepts various data sources
- **Example Config Template** - Template for creating personal configurations
- **Complete Documentation** - Team guide with best practices and examples

## Features

✅ **Personalized Dashboards** - Each team member creates their own dashboard
✅ **Vista View Integration** - Fetch projects dynamically from your Vista views
✅ **Flexible Data Sources** - Use project IDs, Vista filters, or saved configs
✅ **Email Updates** - Optionally send dashboard summaries to your team
✅ **Multiple Dashboards** - Maintain separate dashboards for different purposes
✅ **No Code Changes** - Team members just provide their own parameters

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shivambansal-razor/claude-code-skills.git
cd claude-code-skills
```

### 2. Set Up Prerequisites

Ensure you have these environment variables set in your `~/.zshrc`:

```bash
export DEVREV_PAT="your-devrev-api-token"
# Optional: for email updates
export GMAIL_USER="your-email@example.com"
export GMAIL_APP_PASSWORD="your-app-password"
```

Reload your environment:
```bash
source ~/.zshrc
```

### 3. Use the Skill

Open Claude Code in this directory and run:

```
/dashboard-update
```

Claude will interactively guide you through:
- Selecting your projects (Vista view URL or project IDs)
- Configuring your dashboard name and location
- Setting up email recipients (optional)
- Saving your configuration for future use

## Usage Examples

### Example 1: Quick One-Time Dashboard

```
/dashboard-update
```
Then provide:
- Project IDs: `ENH-12345, ENH-67890, ENH-11111`
- Dashboard name: "My Q4 Projects"
- Email: No

### Example 2: Vista View with Email Updates

```
/dashboard-update
```
Then provide:
- Vista view URL: `https://app.devrev.ai/razorpay/vista/your-view-id`
- Dashboard name: "Team Weekly Status"
- Email: Yes → `team@company.com, manager@company.com`

### Example 3: Command Line Usage

```bash
# Fetch by project IDs
node fetch-projects-parameterized.js --ids "ENH-12345,ENH-67890"

# Fetch using your saved config
node fetch-projects-parameterized.js --config ~/.dashboard-configs/my-config.json
```

## Configuration Files

You can create personal configuration files for frequently updated dashboards:

```bash
# Copy the example template
cp example-team-config.json ~/.dashboard-configs/my-team-dashboard.json

# Edit with your settings
# Then run:
node fetch-projects-parameterized.js --config ~/.dashboard-configs/my-team-dashboard.json
```

See `example-team-config.json` for the structure.

## Documentation

- **[Team Dashboard Guide](TEAM_DASHBOARD_GUIDE.md)** - Comprehensive guide with examples, best practices, and troubleshooting
- **[Example Config](example-team-config.json)** - Template showing all configuration options

## Common Use Cases

### For Team Leads
- Weekly team status dashboards
- Critical items monitoring (P0/P1 issues)
- Cross-team dependency tracking

### For Individual Contributors
- Personal task tracker
- Items pending your review
- Your assigned enhancements

### For Product/Program Managers
- Quarterly OKR tracking
- Product area specific dashboards
- Monthly accomplishments reports

### For Support Teams
- Active merchant issues
- SLA at-risk items
- Support ticket tracking

## Requirements

- **Claude Code CLI** - Latest version
- **Node.js** - v18 or higher
- **DevRev API Access** - `DEVREV_PAT` environment variable
- **Gmail Access** (optional) - For email updates

## Team Collaboration

### Sharing Configs (Without Credentials)

You can share config templates with teammates:

```bash
# Remove sensitive data from your config
cp ~/.dashboard-configs/my-config.json ./shared-configs/team-template.json
# Edit to remove credentials, then commit

git add shared-configs/team-template.json
git commit -m "Add team dashboard template"
git push
```

### Multiple Team Members

Each team member:
1. Clones this repository
2. Sets up their own `DEVREV_PAT` in their environment
3. Creates their own personal configs
4. Uses the skill with their own parameters

**No conflicts** - everyone maintains their own dashboards independently!

## Troubleshooting

### "No enhancements found"
- Verify your `DEVREV_PAT` is set: `echo $DEVREV_PAT`
- Check project IDs are correct
- Ensure you have access to the projects in DevRev

### "Email send failed"
- Verify Gmail MCP setup (see setup guides)
- Check recipient email addresses
- Ensure `~/.zshrc` environment variables are loaded

### Skill not found
- Ensure you're in the correct directory
- Check `.skills/` folder exists
- Try `git pull` to get latest updates

## Contributing

This is a team-shared repository. To contribute improvements:

1. Create a feature branch
2. Make your changes
3. Test with your own dashboards
4. Submit a pull request with clear description

## Support

For questions or issues:
1. Check the [Team Dashboard Guide](TEAM_DASHBOARD_GUIDE.md)
2. Review example configs in `example-team-config.json`
3. Ask in team channel
4. Open an issue in this repository

## License

Internal use only - Razorpay team members

## Credits

Created with Claude Code for the Razorpay engineering team.

---

**Happy Dashboard Building!** 🚀
