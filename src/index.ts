import { EventBridgeEvent, Context } from 'aws-lambda';

// We can loosely type the detail for the standard EventBridge cron event
export const handler = async (
    event: EventBridgeEvent<any, any>, 
    context: Context
): Promise<{ statusCode: number; body: string }> => {
    
    const TOKEN = process.env.META_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    const RECIPIENT_NUMBERS = (process.env.RECIPIENT_NUMBERS || '').split(',');

    const reminderText = "Hey! This is your daily reminder to stretch and drink some water! 💧";
    
    console.log("⏰ Lambda triggered! Sending reminders...");

    for (const rawNumber of RECIPIENT_NUMBERS) {
        const number = rawNumber.trim();
        if (!number) continue;

        try {
            const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: number,
                    type: 'text',
                    text: { body: reminderText }
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Sent to ${number}, ID: ${data.messages?.[0]?.id}`);
            } else {
                console.error(`❌ Failed to send to ${number}:`, JSON.stringify(data));
            }
        } catch (error) {
             console.error(`❌ Network error for ${number}:`, error);
        }
    }
    
    return { statusCode: 200, body: 'Reminders execution finished.' };
};