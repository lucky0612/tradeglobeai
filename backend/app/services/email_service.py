import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

class EmailService:
    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send HTML email"""
        try:
            message = MIMEMultipart('alternative')
            message['From'] = settings.SMTP_FROM_EMAIL
            message['To'] = to_email
            message['Subject'] = subject
            
            html_part = MIMEText(html_content, 'html')
            message.attach(html_part)
            
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        except Exception as e:
            print(f"Failed to send email: {str(e)}")

    async def send_document_status_email(self, user_email: str, document_id: str, status: str):
        """Send document status notification email"""
        subject = f"Document Status Update - {document_id}"
        html_content = f"""
        <h2>Document Status Update</h2>
        <p>Your document {document_id} status has been updated to: <strong>{status}</strong></p>
        <p>You can view the document details by clicking the button below:</p>
        <a href="{settings.FRONTEND_URL}/documents/{document_id}" 
           style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           View Document
        </a>
        """
        await self.send_email(user_email, subject, html_content)

    async def send_claim_status_email(self, user_email: str, claim_id: str, status: str, claim_type: str):
        """Send claim status notification email"""
        subject = f"{claim_type} Claim Status Update - {claim_id}"
        html_content = f"""
        <h2>{claim_type} Claim Status Update</h2>
        <p>Your claim {claim_id} status has been updated to: <strong>{status}</strong></p>
        <p>You can view the claim details by clicking the button below:</p>
        <a href="{settings.FRONTEND_URL}/{claim_type.lower()}/claims/{claim_id}" 
           style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           View Claim
        </a>
        """
        await self.send_email(user_email, subject, html_content)