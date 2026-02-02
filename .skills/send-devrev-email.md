# Send DevRev Email Update

**Skill Name:** send-devrev-email
**Version:** 1.0.0
**Created:** 2026-01-27

## Description

Send automated email updates for DevRev FY26 Q4 Cross Border Group Level Key Projects using Gmail MCP. This skill fetches the latest project data from DevRev and sends a professionally formatted HTML email to specified recipients.

## When to Use This Skill

- User asks to send Q4 email updates
- User wants to email DevRev project status
- User mentions sending weekly/quarterly updates
- User asks to email project reports to team members

## Required Tools

- **Gmail MCP:** `send_email` tool (must be configured)
- **DevRev API:** For fetching project data
- **Node.js script:** `send-q4-email-gmail.js` (already exists)

## Instructions for Claude

### Step 1: Ask for Recipients

Always start by asking the user for recipient email addresses:

```
"Who should receive the FY26 Q4 email update?
Please provide email addresses (comma-separated, no spaces):
Example: person1@razorpay.com,person2@razorpay.com"
```

### Step 2: Fetch DevRev Data

Run the data fetching script to get the latest Q4 projects:

```bash
cd /Users/shivam.bansal/Documents/claude-code
source email-config.sh
node send-q4-email-gmail.js
```

This will:
- Fetch FY26 Q4 Group Level Key Projects from DevRev
- Generate HTML email with project details
- Save preview to `q4-email-preview.html`

### Step 3: Extract Email Content

Read the generated HTML preview:

```bash
cat q4-email-preview.html
```

Extract:
- Email subject: "Cross Border FY26 Q4 - Key Projects Weekly Update"
- Email HTML body (the entire HTML content)
- Number of projects found

### Step 4: Send Email via Gmail MCP

Use the Gmail MCP `send_email` tool:

**Parameters:**
- `to`: The recipient email addresses from Step 1
- `subject`: "Cross Border FY26 Q4 - Key Projects Weekly Update"
- `body`: Plain text summary (e.g., "See attached Q4 project updates")
- `html`: The complete HTML from the preview file

**Example:**
```
Use the send_email tool with:
- to: "recipient1@razorpay.com,recipient2@razorpay.com"
- subject: "Cross Border FY26 Q4 - Key Projects Weekly Update"
- body: "Please find the FY26 Q4 Cross Border Group Level Key Projects update below."
- html: [full HTML content from q4-email-preview.html]
```

### Step 5: Confirm Success

After sending, confirm to the user:

```
"✅ Email sent successfully to:
   - recipient1@razorpay.com
   - recipient2@razorpay.com

📊 Summary: X Group Level Key Projects for FY26 Q4

The email includes:
- Clickable Issue IDs
- Project Names, Stages, RAG Status
- Target Close Dates
- Latest Weekly Updates
```

## Alternative Flow: Quick Send

If user provides recipients upfront:

```
User: "Send the Q4 email to john@razorpay.com,jane@razorpay.com"
```

Skip Step 1 and proceed directly to Step 2.

## Error Handling

### Gmail MCP Not Available

If Gmail MCP is not loaded:

```
"❌ Gmail MCP server is not available. Please restart Claude Code to load it.

Alternative: Run the manual script:
  cd /Users/shivam.bansal/Documents/claude-code
  source email-config.sh
  export EMAIL_RECIPIENTS='your-recipients@razorpay.com'
  node send-q4-email-gmail.js
```

### DevRev API Error

If data fetching fails:

```
"❌ Failed to fetch DevRev data. Please check:
  - DEVREV_API_TOKEN is valid
  - DevRev API is accessible
  - Network connection is working
```

### No Recipients Provided

If user doesn't provide recipients:

```
"⚠️  No recipients specified. Would you like to:
  1. Send test email to yourself (shivam.bansal@razorpay.com)
  2. Provide recipient email addresses
  3. Cancel and save as preview only
```

## Customization Options

Allow user to customize:

1. **Recipients** - Always ask or use provided list
2. **Subject Line** - Allow custom subject (default: "Cross Border FY26 Q4 - Key Projects Weekly Update")
3. **Additional Message** - Add custom intro text
4. **Quarter** - Support FY26 Q2, Q3, Q4 (future enhancement)

## Example Interactions

### Example 1: Basic Usage

```
User: /send-devrev-email

Claude: "Who should receive the FY26 Q4 email update?"

User: "alice@razorpay.com,bob@razorpay.com"

Claude: "Fetching latest FY26 Q4 projects from DevRev..."
        [Runs script, fetches data]
        "Found 7 Group Level Key Projects. Sending email..."
        [Uses Gmail MCP to send]
        "✅ Email sent successfully to alice@razorpay.com, bob@razorpay.com"
```

### Example 2: Quick Send

```
User: "Send the Q4 update to team@razorpay.com"

Claude: [Automatically detects recipients, fetches data, sends email]
        "✅ Email sent successfully to team@razorpay.com"
```

### Example 3: Preview Only

```
User: "Show me what the Q4 email looks like"

Claude: [Fetches data, generates preview]
        "Here's a preview of the email:
        - 7 projects included
        - Preview saved to: q4-email-preview.html

        Would you like to send it now?"

User: "Yes, send to manager@razorpay.com"

Claude: [Sends email via Gmail MCP]
```

## Technical Details

### Data Source
- **API:** DevRev `/parts.list` endpoint
- **Filter:** FY26 Q4 + Cross Border Product + Group Level Key Projects
- **Fields:** Issue ID, Name, Stage, Current RAG, Quarter RAG, Target Close Date, Weekly Update

### Email Format
- **From:** "Shivam Bansal - Cross Border" <shivam.bansal@razorpay.com>
- **Format:** Professional HTML with responsive design
- **Features:** Clickable links, color-coded RAG status, mobile-friendly

### Script Location
- **Script:** `/Users/shivam.bansal/Documents/claude-code/send-q4-email-gmail.js`
- **Config:** `/Users/shivam.bansal/Documents/claude-code/email-config.sh`
- **Preview:** `/Users/shivam.bansal/Documents/claude-code/q4-email-preview.html`

## Security Considerations

- Gmail App Password is stored in MCP config (secured)
- Never expose passwords in chat or logs
- Recipients are validated (must be valid email format)
- Preview file is saved locally (not sensitive)

## Future Enhancements

- [ ] Support multiple quarters (Q2, Q3, Q4)
- [ ] Allow custom filters (Pod level, Sub Group level)
- [ ] Add email scheduling (cron integration)
- [ ] Support attachments (CSV export)
- [ ] Email templates for different stakeholders
- [ ] BCC support for large distribution lists

## Related Skills

- `devrev-query` - Query DevRev data
- `email-automation` - General email automation

## Maintenance

- **Update Recipients:** Modify default recipient list if needed
- **Update Email Template:** Edit `send-q4-email-gmail.js` HTML template
- **Update Filters:** Modify DevRev query filters for different projects

---

**Usage:** Simply say "Send Q4 email" or "Send DevRev email update" or use `/send-devrev-email`
