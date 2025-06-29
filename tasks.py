import time
import csv
import os
from io import StringIO, BytesIO
from datetime import datetime
from celery import shared_task
from run import create_app
from flask import render_template
from app.models import db, Campaign, AdRequest, Admin, Influencer, Sponsor
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from weasyprint import HTML

EXPORT_FOLDER = 'exported_csv_files'

if not os.path.exists(EXPORT_FOLDER):
    os.makedirs(EXPORT_FOLDER)

@shared_task(ignore_results=False)
def add(x, y):
    """Simple Celery task to add two numbers."""
    app, celery_app = create_app()
    with app.app_context():
        time.sleep(10)
        return x + y

@shared_task(ignore_results=False)
def export_completed_campaigns_adrequest(user_id):
    """Export completed campaigns and ad-requests for a user into a CSV."""
    app, _ = create_app()
    with app.app_context():
        campaigns = Campaign.query.filter_by(sponsor_id=user_id, status='completed').all()
        ad_requests = AdRequest.query.filter_by(sponsor_id=user_id, status='completed').all()

        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer)

        csv_writer.writerow(["Type", "ID", "Title", "Description", "Budget", "Category", "Status", "Start Date", "End Date", "Additional Info"])

        for campaign in campaigns:
            csv_writer.writerow([
                "Campaign", campaign.id, campaign.title, campaign.description,
                campaign.budget, campaign.category, campaign.status,
                campaign.start_date.isoformat() if campaign.start_date else None,
                campaign.end_date.isoformat() if campaign.end_date else None,
                f"Payment Flag: {campaign.payment_flag}, Flag: {campaign.flag}"
            ])

        for ad_request in ad_requests:
            csv_writer.writerow([
                "AdRequest", ad_request.id, ad_request.title, ad_request.description,
                ad_request.budget, ad_request.category, ad_request.status,
                ad_request.start_date.isoformat() if ad_request.start_date else None,
                ad_request.end_date.isoformat() if ad_request.end_date else None,
                f"Negotiated Price: {ad_request.negotiate_price}, Payment Flag: {ad_request.payment_flag}"
            ])

        send_completion_alert(user_id)
        return csv_buffer.getvalue()

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_completion_alert(user_id, from_email="admin@brandifiers.com", smtp_server="localhost", smtp_port=1025):
    """
    Send an email alert after the export is completed.

    Args:
        user_id (int): ID of the user to notify.
        from_email (str, optional): Sender's email address. Defaults to 'admin@brandifiers.com'.
        smtp_server (str, optional): SMTP server address. Defaults to 'localhost'.
        smtp_port (int, optional): SMTP server port. Defaults to 1025.
    """
    try:
        # Get the user's email
        user_email = get_user_email(user_id)
        if not user_email:
            raise ValueError(f"No email found for user ID {user_id}")

        # Create the email message
        msg = MIMEMultipart()
        msg['To'] = user_email
        msg['Subject'] = "Campaign Export Completed"
        msg['From'] = from_email

        # Email body
        body = """
        <html>
        <head><title>Export Completed</title></head>
        <body>
            <p>Dear User,</p>
            <p>The export of completed campaigns and ad-requests has been successfully completed.</p>
            <p>Thank you for using our services!</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))  # Attach the email body as HTML

        # Send the email
        with smtplib.SMTP(host=smtp_server, port=smtp_port) as server:
            server.sendmail(from_email, user_email, msg.as_string())

        print(f"Completion alert successfully sent to {user_email}")

    except Exception as e:
        print(f"Failed to send completion alert to user ID {user_id}: {e}")


def get_user_email(user_id):
    """Fetch the user's email from the database."""
    user = Admin.query.get(user_id)
    return user.email

@shared_task
def send_daily_reminders():
    """Send daily reminders to influencers."""
    app, _ = create_app()
    with app.app_context():
        influencers = get_influencers()  # Fetch influencers and their preferences
        for influencer in influencers:
            try:
                # Set a default subject
                subject = "Daily Reminder"
                content = f"<h1>Hello {influencer.name},</h1><p>You have {get_pending_requests(influencer.id)} requests pending. Visit Brandifer.com for more details.</p>"
                send_email(influencer.email, subject, content)
            except Exception as e:
                app.logger.error(f"Failed to send email to {influencer.email}: {e}")

def get_pending_requests(influencer_id):
    """Fetch the number of pending requests for the influencer."""
    return AdRequest.query.filter_by(id=influencer_id, status='requested').count()


def get_influencers():
    """Fetch influencers and their reminder preferences."""
    return Influencer.query.all()

from email.mime.base import MIMEBase
from email import encoders

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import smtplib

def send_email(to_email, subject, html_content, attachment=None, smtp_server='localhost', smtp_port=1025):
    """
    Send an email with optional attachment using a local SMTP server.
    
    Args:
        to_email (str): Recipient's email address.
        subject (str): Email subject.
        html_content (str): HTML content of the email.
        attachment (file-like object, optional): File to attach. Defaults to None.
        smtp_server (str, optional): SMTP server address. Defaults to 'localhost'.
        smtp_port (int, optional): SMTP server port. Defaults to 1025.
    """
    from_email = 'admin@brandifiers.com'

    try:
        # Create a multipart message
        msg = MIMEMultipart('alternative')
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach the HTML content
        msg.attach(MIMEText(html_content, 'html'))

        # Attach a file if provided
        if attachment:
            attachment.seek(0)  # Ensure the file pointer is at the start
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            filename = 'attachment.html'  # Default filename for the attachment
            part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            msg.attach(part)

        # Send the email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.sendmail(from_email, to_email, msg.as_string())
        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")




@shared_task
def generate_monthly_report():
    """
    Generate and send a monthly activity report to all sponsors.
    """
    app, _ = create_app()
    with app.app_context():
        # Get the current month and year
        current_month = datetime.utcnow().strftime('%B')
        current_year = datetime.utcnow().year

        # Query all sponsors
        sponsors = Sponsor.query.all()

        for sponsor in sponsors:
            try:
                # Fetch sponsor-specific data
                campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
                ad_requests = AdRequest.query.filter_by(sponsor_id=sponsor.id, status="completed").all()

                # Calculate statistics
                total_campaigns = len(campaigns)
                total_ads = len(ad_requests)
                total_budget_used = sum(campaign.budget for campaign in campaigns if campaign.budget)
                remaining_budget = sum(
                    campaign.budget for campaign in campaigns if campaign.budget and campaign.status != 'completed'
                )

                # Prepare the HTML content for the email
                html_content = f"""
                <html>
                <head><title>Monthly Activity Report</title></head>
                <body>
                    <h1>Monthly Activity Report</h1>
                    <p>Dear {sponsor.name},</p>
                    <p>Here are your statistics for {current_month} {current_year}:</p>
                    <ul>
                        <li>Total Campaigns: {total_campaigns}</li>
                        <li>Total Ads: {total_ads}</li>
                        <li>Total Budget Used: ${total_budget_used:.2f}</li>
                        <li>Remaining Budget: ${remaining_budget:.2f}</li>
                    </ul>
                    <p>Thank you for your partnership!</p>
                </body>
                </html>
                """

                # Send the email
                subject = f"Monthly Activity Report - {current_month} {current_year}"
                send_email(sponsor.email, subject, html_content)
                print(f"Report sent successfully to {sponsor.email}")

            except Exception as e:
                app.logger.error(f"Failed to send report to {sponsor.email}: {e}")