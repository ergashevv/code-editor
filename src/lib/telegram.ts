// Telegram notification service

export interface HomeworkNotificationData {
  username: string;
  userId: string;
  lessonSlug: string;
  lessonTitle: string;
  score: number;
  xpAwarded: number;
  submittedAt: Date;
}

/**
 * Send Telegram notification when homework is submitted
 */
export async function sendHomeworkTelegram(data: HomeworkNotificationData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn('Telegram bot token or chat ID not configured');
    return;
  }

  const text =
    `✅ Homework submitted\n` +
    `👤 User: ${data.username} (${data.userId})\n` +
    `📘 Lesson: ${data.lessonTitle} (${data.lessonSlug})\n` +
    `📝 Score: ${data.score}\n` +
    `⭐ XP: +${data.xpAwarded}\n` +
    `🕒 When: ${data.submittedAt.toISOString()}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

