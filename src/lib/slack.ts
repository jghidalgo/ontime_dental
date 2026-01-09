/**
 * Slack integration utility for sending notifications
 */

interface SlackMessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: {
    type: string;
    text: {
      type: string;
      text: string;
    };
    url: string;
  };
}

interface SlackMessage {
  text: string;
  blocks?: SlackMessageBlock[];
}

/**
 * Send a message to Slack webhook
 */
export async function sendSlackNotification(
  webhookUrl: string,
  message: SlackMessage
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Slack notification failed:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Format ticket creation notification for Slack
 */
export function formatTicketNotification(ticket: {
  subject: string;
  requester: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  id?: string;
}): SlackMessage {
  const priorityEmoji = {
    'High': '🔴',
    'Medium': '🟡',
    'Low': '🟢',
  }[ticket.priority] || '⚪';

  const statusEmoji = {
    'Open': '🆕',
    'In Progress': '⏳',
    'Scheduled': '📅',
    'Resolved': '✅',
  }[ticket.status] || '📋';

  return {
    text: `New Ticket: ${ticket.subject}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎫 New Ticket Created`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Subject:*\n${ticket.subject}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${priorityEmoji} ${ticket.priority}`,
          },
          {
            type: 'mrkdwn',
            text: `*Requester:*\n${ticket.requester}`,
          },
          {
            type: 'mrkdwn',
            text: `*Location:*\n${ticket.location}`,
          },
          {
            type: 'mrkdwn',
            text: `*Category:*\n${ticket.category}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${statusEmoji} ${ticket.status}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${ticket.description.length > 200 ? ticket.description.substring(0, 200) + '...' : ticket.description}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Created: <!date^${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}^{date_num} {time_secs}|${ticket.createdAt}>`,
          },
        ],
      },
    ],
  };
}

/**
 * Get Slack webhook URL from environment variables
 * You can configure different webhooks for different channels/purposes
 */
export function getSlackWebhookUrl(channel: 'tickets' | 'general' = 'tickets'): string | null {
  const webhookUrls: Record<string, string | undefined> = {
    tickets: process.env.SLACK_WEBHOOK_TICKETS,
    general: process.env.SLACK_WEBHOOK_GENERAL,
  };

  return webhookUrls[channel] || null;
}

/**
 * Send ticket creation notification to Slack
 */
export async function notifyTicketCreated(ticket: {
  subject: string;
  requester: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  id?: string;
}): Promise<boolean> {
  const webhookUrl = getSlackWebhookUrl('tickets');
  
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured. Set SLACK_WEBHOOK_TICKETS in environment variables.');
    return false;
  }

  const message = formatTicketNotification(ticket);
  return sendSlackNotification(webhookUrl, message);
}
