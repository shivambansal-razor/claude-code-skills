# Dashboard Skill - Complete Walkthrough for New Users

A step-by-step guide showing exactly how a new team member would use the `/dashboard-update` skill.

---

## STEP 1: One-Time Setup

```bash
# Clone the repository
cd ~/Documents
git clone https://github.com/shivambansal-razor/claude-code-skills.git
cd claude-code-skills

# Set up DevRev API token
echo 'export DEVREV_PAT="your-token-here"' >> ~/.zshrc
source ~/.zshrc

# Verify
echo $DEVREV_PAT
```

---

## STEP 2: Open Claude Code

```bash
claude
```

---

## STEP 3: Run the Skill

**You type:**
```
/dashboard-update
```

**Claude responds with interactive questions:**

---

### QUESTION 1: How to specify projects?

```
┌─────────────────────────────────────────────────────┐
│ Question: How would you like to specify projects?   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ○ Vista View URL                                    │
│   Fetch from your saved Vista view                  │
│   (Updates automatically when you change filters)   │
│                                                      │
│ ○ Project IDs                                       │
│   Enter specific enhancement IDs (ENH-12345)        │
│   (Fixed list, good for quarterly goals)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**You select:** Vista View URL

**You provide:**
```
https://app.devrev.ai/razorpay/vista/v-abc123xyz
```

---

### QUESTION 2: Dashboard name?

**You select:** Custom

**You enter:**
```
Platform Team - Sprint 45
```

---

### QUESTION 3: Email updates?

**You select:** Yes, send to my team

**You provide:**
- Recipients: `platform-team@razorpay.com, tech-lead@razorpay.com`
- Subject prefix: `Platform Team Update`

---

### QUESTION 4: Save configuration?

**You select:** Yes, save for next time

**You enter config name:**
```
platform-sprint-dashboard
```

---

## STEP 4: Claude Executes (Behind the Scenes)

### A. Parses Vista View

```
🔍 Fetching your Vista view configuration from DevRev...
   Extracting view ID: v-abc123xyz
```

### B. Fetches Projects

```
✅ Found 8 projects:
   • ENH-16343 - Investment via Gift City
   • ENH-16195 - SDK for Stripe
   • ENH-16012 - Retry payments
   • ENH-15925 - Agent of the Payee Model
   • ENH-15913 - International Checkout
   • ENH-12675 - EEFC Enablement
   • ENH-8657  - Banking Circle Integration
   • ENH-7234  - Payment Gateway Optimization
```

### C. Creates Config File

**Location:** `~/.dashboard-configs/platform-sprint-dashboard.json`

**Content:**
```json
{
  "dashboard_name": "Platform Team - Sprint 45",
  "data_source": {
    "type": "vista_view",
    "vista_view_url": "https://app.devrev.ai/razorpay/vista/v-abc123xyz"
  },
  "output": {
    "directory": "./dashboards",
    "filename": "platform-sprint-45.html"
  },
  "email": {
    "enabled": true,
    "recipients": [
      "platform-team@razorpay.com",
      "tech-lead@razorpay.com"
    ],
    "subject_prefix": "Platform Team Update"
  }
}
```

### D. Generates Dashboard HTML

```
📝 Generating dashboard HTML...

Processing:
  • Calculating metrics (On Track, Delayed, At Risk)
  • Extracting executive summary
  • Creating project table
  • Applying styling
```

**Dashboard includes:**
- Header with name and date
- Metric cards (🟢 5 On Track, 🟠 2 Delayed, 🔴 1 At Risk)
- Executive summary (Highlights, Lowlights, Callouts)
- Detailed project table with RAG status, dates, updates
- Clickable links to DevRev

```
✅ Dashboard created: ./dashboards/platform-sprint-45.html
```

### E. Sends Email

```
📧 Sending email...

To: platform-team@razorpay.com, tech-lead@razorpay.com
Subject: Platform Team Update - February 3, 2025

Content:
  📊 8 projects: 5 on track, 2 delayed, 1 at risk
  ✅ Highlights
  ⚠️ Items needing attention

✅ Email sent successfully!
```

---

## STEP 5: Final Summary

```
🎉 Dashboard Update Complete!

📊 Summary:
   • 8 projects fetched
   • 🟢 On Track: 5
   • 🟠 Delayed: 2
   • 🔴 At Risk: 1

📁 Dashboard: ./dashboards/platform-sprint-45.html
📧 Email sent to 2 recipients
💾 Config saved: ~/.dashboard-configs/platform-sprint-dashboard.json

🔗 Open: file:///Users/yourname/.../platform-sprint-45.html

💡 Next time: Just run /dashboard-update and select "Use saved config"
```

---

## STEP 6: View Your Dashboard

```bash
open ./dashboards/platform-sprint-45.html
```

**Browser shows:**
- Beautiful, professional dashboard
- Color-coded metrics
- Executive summary
- Detailed project table
- All data from your Vista view

---

## STEP 7: Update Next Week

**You type:**
```
/dashboard-update
```

**Claude remembers:**
```
┌─────────────────────────────────────────────────────┐
│ Found saved config:                                  │
│ • platform-sprint-dashboard.json                    │
│                                                      │
│ ○ Use saved config (Recommended)                    │
│   Quick 10-second update                            │
│                                                      │
│ ○ Create new configuration                          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**You select:** Use saved config

**Claude does everything automatically in 10 seconds!**

---

## How Vista Integration Works (The Magic!)

### Traditional Approach (Static)
```json
{
  "project_ids": ["ENH-1", "ENH-2", "ENH-3"]
}
```
❌ Problem: Must manually update when projects change

### Vista View Approach (Dynamic)
```json
{
  "vista_view_url": "https://app.devrev.ai/razorpay/vista/v-abc123"
}
```
✅ Automatically updates based on your Vista filters

### How It Works:

**1. You create Vista view in DevRev:**
- Set filters: stage=in_progress, owned_by=platform-team
- Save the view
- Copy the URL

**2. Skill fetches projects:**
- Reads Vista view definition from DevRev API
- Applies current filters
- Gets matching projects

**3. You update filters in DevRev (anytime):**
- Add new tags
- Change assignees
- Update stages
- Remove completed items

**4. Next dashboard update:**
- Automatically picks up new filters
- No config changes needed
- Always current

### The Benefits:

✅ **You never touch the config file!**
   - Set it up once
   - All changes happen in DevRev UI

✅ **Your dashboard always reflects current Vista filters**
   - New projects automatically included
   - Completed projects automatically excluded
   - Filter changes take effect immediately

✅ **Dynamic and always up-to-date**
   - Vista view is the single source of truth
   - Dashboard stays in sync with your work
   - Zero maintenance required

---

**That's it! You're ready to use the dashboard skill!** 🚀
