from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from json import encoder
import smtplib
from jinja2 import Template

SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = "QuizMaster@info.in"
SENDER_PASSWORD = ''

def send_email(to_address, subject,message, content = "html", attachment_file=None):
    msg = MIMEMultipart()
    msg["To"] = to_address
    msg["Subject"] = subject
    msg["From"] = SENDER_ADDRESS

    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    if attachment_file:
        with open(attachment_file, 'rb') as attachment:
            part = MIMEBase("application", "oct-stream")
            part.set_payload(attachment.read())
   
        encoder.encode_base64(part)
        part.add_header("content-Disposition", f"attachment; filename={attachment_file}")
        msg.attach(part)

    s = smtplib.SMTP(host= SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()

    return True

