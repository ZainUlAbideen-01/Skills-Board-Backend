import env from './env';

// We replace Nodemailer with a mock transporter that uses the Brevo HTTP API
// This allows us to keep the existing `.sendMail()` syntax across the app
const transporter = {
    sendMail: async (options: { from: string; to: string; subject: string; html: string }) => {
        if (!env.BREVO_API_KEY) {
            console.error('Brevo API key is missing. Cannot send email.');
            return;
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'Local Skill Exchange', email: options.from },
                    to: [{ email: options.to }],
                    subject: options.subject,
                    htmlContent: options.html
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Brevo API Error (${response.status}): ${errorData}`);
            }
            
            console.log(`Email successfully sent to ${options.to} via Brevo`);
        } catch (error) {
            console.error('Failed to send email via Brevo:', error);
            throw error;
        }
    }
};

export default transporter;