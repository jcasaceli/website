const Twilio = require('twilio');

exports.handler = async function(event, context) {
  try {
    const payload = JSON.parse(event.body || '{}');
    const message = payload.message || payload.text || 'New chat message received';

    const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Chat: ${message}`,
      from: process.env.TWILIO_FROM,
      to: process.env.TO_NUMBER
    });

    return { statusCode: 200, body: 'SMS sent' };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + String(err) };
  }
};
