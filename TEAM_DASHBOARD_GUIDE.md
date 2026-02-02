# Team Dashboard System - User Guide

## Overview

This dashboard system allows team members to create and maintain their own project tracking dashboards with data from DevRev. Each team member can have their own configuration for:

- **Project selection** (via Vista views or specific project IDs)
- **Dashboard customization** (name, styling, metrics)
- **Email updates** (recipients, schedule, format)

## Quick Start

### Option 1: Use the Skill (Recommended)

The easiest way to get started is using the `/dashboard-update` skill in Claude Code:

```bash
/dashboard-update
```

Claude will guide you through:
1. Selecting your projects (Vista view or IDs)
2. Configuring your dashboard
3. Setting up email notifications (optional)
4. Saving your configuration for future use

### Option 2: Create Your Own Config File

1. **Copy the example config:**
   ```bash
   cp example-team-config.json ~/.dashboard-configs/my-config.json
   ```

2. **Edit your config:**
   ```json
   {
     "dashboard_name": "My Team Dashboard",
     "data_source": {
       "type": "project_ids",
       "project_ids": ["ENH-12345", "ENH-67890"]
     },
     "output": {
       "directory": "./my-dashboards",
       "filename": "my-dashboard.html"
     },
     "email": {
       "enabled": true,
       "recipients": ["team@example.com"],
       "subject_prefix": "My Team Update"
     }
   }
   ```

3. **Run the update:**
   ```bash
   node fetch-projects-parameterized.js --config ~/.dashboard-configs/my-config.json
   ```

## Configuration Options

### Data Source Options

#### Option A: Specific Project IDs
Best for: Fixed list of projects that don't change often

```json
{
  "data_source": {
    "type": "project_ids",
    "project_ids": [
      "ENH-16343",
      "ENH-16195",
      "ENH-16012"
    ]
  }
}
```

#### Option B: Vista View Filters
Best for: Dynamic project lists based on filters (stage, assignee, tags, etc.)

```json
{
  "data_source": {
    "type": "vista_filters",
    "vista_filters": {
      "stage": "in_progress",
      "owned_by": ["user-id-here"],
      "tags": ["Q4", "high-priority"]
    }
  }
}
```

### Email Configuration

```json
{
  "email": {
    "enabled": true,
    "recipients": [
      "team-lead@company.com",
      "stakeholder@company.com"
    ],
    "subject_prefix": "Weekly Update",
    "send_day": "Monday"
  }
}
```

### Output Configuration

```json
{
  "output": {
    "directory": "/Users/yourname/Documents/dashboards",
    "filename": "team-dashboard.html"
  }
}
```

## Using Vista Views

Vista views are powerful because they allow you to:
- Update filter criteria in DevRev UI
- Dashboard automatically uses latest filters
- No need to modify config file

### How to Use Your Vista View:

1. **Create a Vista view in DevRev** with your desired filters
2. **Copy the Vista URL** (e.g., `https://app.devrev.ai/razorpay/vista/view-123`)
3. **Extract the filters** (or use the skill to do it automatically)
4. **Add to config:**

```json
{
  "data_source": {
    "type": "vista_view",
    "vista_view_url": "https://app.devrev.ai/razorpay/vista/view-123"
  }
}
```

## Command Line Usage

### Fetch by Project IDs
```bash
node fetch-projects-parameterized.js --ids "ENH-12345,ENH-67890,ENH-11111"
```

### Fetch by Config File
```bash
node fetch-projects-parameterized.js --config ~/.dashboard-configs/my-config.json
```

### Fetch by Vista Filters
```bash
node fetch-projects-parameterized.js --vista-filters '{"stage":"in_progress","owned_by":["user-id"]}'
```

## Team Collaboration

### Sharing Configurations

You can share configurations (without credentials) with teammates:

1. **Export your config** (remove sensitive data):
   ```bash
   # Copy your config template
   cp ~/.dashboard-configs/my-config.json ./shared-configs/team-x-template.json
   ```

2. **Team members can use it as starting point:**
   ```bash
   cp ./shared-configs/team-x-template.json ~/.dashboard-configs/my-personal-config.json
   # Then customize with their own settings
   ```

### Multiple Dashboards

You can maintain multiple dashboards for different purposes:

```bash
~/.dashboard-configs/
├── q4-key-projects.json      # Q4 initiatives
├── team-weekly-updates.json   # Weekly standup tracking
├── high-priority-bugs.json    # Critical issues
└── my-personal-tasks.json     # Individual work items
```

Run updates for each:
```bash
node fetch-projects-parameterized.js --config ~/.dashboard-configs/q4-key-projects.json
node fetch-projects-parameterized.js --config ~/.dashboard-configs/team-weekly-updates.json
```

## Email Updates

### Prerequisites

1. Gmail MCP server must be configured (see `GMAIL_MCP_SETUP_GUIDE.md`)
2. Environment variables must be set in `~/.zshrc`

### Sending Email via Skill

When using the `/dashboard-update` skill, simply answer "Yes" when asked about email updates.

### Manual Email Send

```javascript
// After generating dashboard, send email
const recipients = ["team@example.com", "lead@example.com"];
const subject = "Q4 Dashboard Update - Jan 15, 2025";

// Use Claude Code with Gmail MCP:
// "Send email to <recipients> with dashboard summary"
```

## Automation

### Schedule Dashboard Updates

Create a cron job or use a script:

```bash
#!/bin/bash
# update-all-dashboards.sh

source ~/.zshrc

# Update each dashboard
node fetch-projects-parameterized.js --config ~/.dashboard-configs/q4-key-projects.json
node fetch-projects-parameterized.js --config ~/.dashboard-configs/team-weekly.json

# Send email summary (optional)
# Add email sending logic here
```

Set up weekly execution:
```bash
# Run every Monday at 9 AM
0 9 * * 1 /path/to/update-all-dashboards.sh
```

## Best Practices

### 1. Keep Configs Organized
```
~/.dashboard-configs/
├── team-a/
│   ├── q4-projects.json
│   └── weekly-updates.json
├── team-b/
│   └── sprint-dashboard.json
└── personal/
    └── my-tasks.json
```

### 2. Use Descriptive Names
- Dashboard names: "Q4 Key Projects - Team X"
- Config files: `team-x-q4-projects.json`
- Output files: `team-x-q4-dashboard-2025.html`

### 3. Version Your Configs
```bash
# Keep in git (without credentials)
git add shared-configs/
git commit -m "Add team dashboard configs"
```

### 4. Document Your Filters
Add metadata to configs:
```json
{
  "metadata": {
    "description": "Q4 initiatives for Payments team",
    "filters_updated": "2025-01-15",
    "owner": "team-lead-name"
  }
}
```

## Troubleshooting

### "No enhancements found"
- Check your project IDs are correct
- Verify DevRev API token is set: `echo $DEVREV_PAT`
- Ensure you have access to the projects

### "Email send failed"
- Verify Gmail MCP setup: see `GMAIL_MCP_SETUP_GUIDE.md`
- Check recipient email addresses
- Ensure environment variables are loaded: `source ~/.zshrc`

### "Dashboard not updating"
- Check file paths in config
- Ensure output directory exists
- Verify write permissions

## Examples

### Example 1: Team Weekly Dashboard

**Config:** `~/.dashboard-configs/team-weekly.json`
```json
{
  "dashboard_name": "Team Alpha - Weekly Update",
  "data_source": {
    "type": "vista_filters",
    "vista_filters": {
      "owned_by": ["team-alpha-lead"],
      "stage": ["in_progress", "review"]
    }
  },
  "output": {
    "directory": "./dashboards/team-alpha",
    "filename": "weekly-update.html"
  },
  "email": {
    "enabled": true,
    "recipients": [
      "team-alpha@company.com",
      "engineering-lead@company.com"
    ],
    "subject_prefix": "Team Alpha Weekly"
  }
}
```

**Usage:**
```bash
# Using skill
/dashboard-update --config team-weekly

# Or command line
node fetch-projects-parameterized.js --config ~/.dashboard-configs/team-weekly.json
```

### Example 2: Personal Task Tracker

**Config:** `~/.dashboard-configs/my-tasks.json`
```json
{
  "dashboard_name": "My Tasks",
  "data_source": {
    "type": "vista_filters",
    "vista_filters": {
      "owned_by": ["my-user-id"],
      "state": ["open", "in_progress"]
    }
  },
  "output": {
    "directory": "~/Documents/my-dashboards",
    "filename": "my-tasks.html"
  },
  "email": {
    "enabled": false
  }
}
```

## Support

For questions or issues:
1. Check this guide first
2. Review the example configs in `shared-configs/`
3. Ask in team channel
4. Contact dashboard system maintainer

## Advanced: Custom Dashboard Templates

You can customize the HTML template used for dashboards by:

1. Creating a custom template file
2. Modifying the dashboard generation script
3. Adding custom CSS/styling
4. Including team-specific branding

See `ADVANCED_CUSTOMIZATION.md` (coming soon) for details.
