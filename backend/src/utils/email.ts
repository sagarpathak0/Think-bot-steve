import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

export async function sendOtpEmail(email: string, otp: string) {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  } as any);
  await transporter.sendMail({
    from: `ThinkBot <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your ThinkBot OTP',
    text: `Your OTP is: ${otp}`,
  });
}
