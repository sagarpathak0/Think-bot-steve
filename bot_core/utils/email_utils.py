import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import base64

def send_verification_email(email, subject, body):
    GMAIL_USER = os.getenv("EMAIL")
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not all([GMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]):
        print("[ERROR] Gmail OAuth2 credentials not set in environment variables.")
        return False

    msg = MIMEMultipart()
    msg['From'] = GMAIL_USER
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    creds = Credentials(
        None,
        refresh_token=REFRESH_TOKEN,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token"
    )
    creds.refresh(Request())
    access_token = creds.token

    auth_string = f"user={GMAIL_USER}\1auth=Bearer {access_token}\1\1"
    auth_string = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.docmd('AUTH', 'XOAUTH2 ' + auth_string)
            server.sendmail(GMAIL_USER, email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False
