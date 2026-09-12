import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppCode(toPhoneNumber: string, code: string) {
  try {
    const message = await client.messages.create({
      body: `رمز التحقق الخاص بك في منصة ملاعب هو: ${code}`,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${toPhoneNumber}`
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("خطأ في إرسال الواتساب:", error);
    return { success: false, error };
  }
}
