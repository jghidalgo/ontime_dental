# Slack Integration for Ticket Notifications

This feature automatically sends notifications to a Slack channel whenever a new ticket is created in the system.

## Setup Instructions

### 1. Create a Slack Incoming Webhook

1. Go to your Slack workspace
2. Navigate to **Apps** → **Manage Apps** → **Custom Integrations** → **Incoming Webhooks**
3. Click **Add to Slack**
4. Choose the channel where you want ticket notifications to appear (e.g., `#support-tickets`, `#helpdesk`)
5. Click **Add Incoming Webhooks Integration**
6. Copy the **Webhook URL** (it looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)


### 2. Configure Environment Variable

Add the Slack webhook URL to your `.env.local` file:

```env
SLACK_WEBHOOK_TICKETS=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Important:** Never commit this URL to your repository. The `.env.local` file should be in your `.gitignore`.

### 3. Restart Your Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

When a ticket is created through the GraphQL API, the system will:

1. Save the ticket to the database
2. Send a formatted notification to your Slack channel with:
   - Ticket subject
   - Priority (with emoji: 🔴 High, 🟡 Medium, 🟢 Low)
   - Requester name
   - Location
   - Category
   - Status (with emoji: 🆕 Open, ⏳ In Progress, 📅 Scheduled, ✅ Resolved)
   - Description (truncated if longer than 200 characters)
   - Creation timestamp

## Notification Example

```
🎫 New Ticket Created

Subject: Printer not working in Office 3
Priority: 🔴 High

Requester: John Doe
Location: Downtown Office

Category: Equipment
Status: 🆕 Open

Description: The HP printer in office 3 stopped working this morning. 
Need urgent assistance as we have important documents to print.

Created: Nov 16, 2025 2:30 PM
```

## Multiple Channels (Optional)

You can configure different webhooks for different purposes by adding more environment variables:

```env
SLACK_WEBHOOK_TICKETS=https://hooks.slack.com/services/YOUR/TICKETS/URL
SLACK_WEBHOOK_GENERAL=https://hooks.slack.com/services/YOUR/GENERAL/URL
```

## Troubleshooting

### Notifications not appearing?

1. **Check the webhook URL** - Make sure it's correctly set in `.env.local`
2. **Restart the server** - Environment variables are loaded at startup
3. **Check server logs** - Look for any Slack-related error messages
4. **Verify the webhook is active** - Test it with a curl command:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test message"}' \
YOUR_WEBHOOK_URL
```

### Slack notifications failing silently

The system is designed to fail gracefully - if Slack is unavailable or misconfigured, ticket creation will still succeed. Check your server logs for warning messages.

## Customization

You can customize the notification format by editing:
- `src/lib/slack.ts` - Modify the `formatTicketNotification` function
- Change emojis, add more fields, or adjust the message layout

## Security Notes

- ✅ Webhook URLs are kept server-side only (never sent to client)
- ✅ Slack notifications run asynchronously and don't block ticket creation
- ✅ Failed Slack notifications don't prevent ticket creation
- ⚠️ Make sure your Slack channel permissions are appropriate for ticket information

## Additional Resources

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) - Design custom message layouts
