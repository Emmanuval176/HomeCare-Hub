import os
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import datetime

logger = logging.getLogger(__name__)

def get_from_email():
    return getattr(settings, 'DEFAULT_FROM_EMAIL', 'HomeCare Hub <notifications@homecarehub.com>')

def send_welcome_email(user):
    """Send a welcome email to the newly registered user."""
    if not user.email:
        logger.warning(f"User {user.username} has no email address. Skipping welcome email.")
        return False

    name = user.first_name or user.username
    subject = "✨ Welcome to HomeCare Hub - Smart Home Appliance Management"
    
    plain_message = f"""Hello {name},

Welcome to HomeCare Hub! Your account has been created successfully.

With HomeCare Hub, you can:
- Track all your home appliances, model numbers, and purchase details
- Store invoices, bills, and warranty cards with automated OCR
- Receive timely email alerts for routine maintenance and servicing
- Keep tabs on warranties so you never miss an expiration deadline

Log in anytime at: http://localhost:3000/

Best regards,
The HomeCare Hub Team
"""

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }}
        .logo {{ width: 36px; height: 36px; border-radius: 50%; background: #000000; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; line-height: 36px; text-align: center; }}
        .title {{ font-size: 20px; font-weight: 800; color: #000000; margin: 0; }}
        .tagline {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }}
        h1 {{ font-size: 22px; font-weight: 700; color: #111827; margin-top: 0; }}
        p {{ font-size: 14px; line-height: 1.6; color: #4b5563; }}
        .feature-box {{ background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 20px 0; }}
        .feature-item {{ margin: 8px 0; font-size: 13px; color: #374151; }}
        .btn {{ display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 16px; }}
        .footer {{ font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">H</div>
          <div>
            <div class="title">HomeCare Hub</div>
            <div class="tagline">Smart Home Appliance Care</div>
          </div>
        </div>
        <h1>Welcome, {name}!</h1>
        <p>Your account with <strong>{user.email}</strong> is ready. You can now effortlessly manage your household appliances, schedule service appointments, and never lose track of a warranty again.</p>
        
        <div class="feature-box">
          <div class="feature-item">✓ <strong>Instant Appliance Vault:</strong> Keep models, serial numbers & images secure.</div>
          <div class="feature-item">✓ <strong>OCR Bill Extraction:</strong> Snap a bill and auto-extract key details.</div>
          <div class="feature-item">✓ <strong>Automated Service Reminders:</strong> Direct email alerts on service days.</div>
          <div class="feature-item">✓ <strong>Warranty Expiry Protection:</strong> Avoid missing claim deadlines.</div>
        </div>

        <a href="http://localhost:3000/" class="btn">Open Dashboard →</a>

        <div class="footer">
          Sent by HomeCare Hub Platform. You received this email because you registered on HomeCare Hub.
        </div>
      </div>
    </body>
    </html>
    """

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Welcome email sent successfully to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Error sending welcome email to {user.email}: {e}")
        return False


def send_service_reminder_email(user, schedule, is_today=False):
    """
    Send an email reminder for an appliance service schedule.
    Matches user format: 'your service for the [Appliance] product is today...'
    """
    if not user.email:
        logger.warning(f"User {user.username} has no email address. Skipping service email.")
        return False

    appliance_name = schedule.appliance.name if schedule.appliance else "Appliance"
    brand_model = f"{schedule.appliance.brand} {schedule.appliance.model_number}".strip() if schedule.appliance else ""
    date_str = str(schedule.next_service_date)
    name = user.first_name or user.username

    if is_today:
        subject = f"⏰ Service Alert: Your service for the {appliance_name} is today!"
        time_text = "is scheduled for TODAY"
        badge_color = "#dc2626"
    else:
        subject = f"🔔 Service Reminder: Your service for the {appliance_name} is due on {date_str}"
        time_text = f"is due on {date_str}"
        badge_color = "#2563eb"

    plain_message = f"""Hello {name},

This is a reminder that your service for the {appliance_name} {brand_model} {time_text}.

Service Details:
- Appliance: {appliance_name} ({brand_model})
- Service Type: {schedule.service_type}
- Scheduled Date: {date_str}
- Frequency: {schedule.frequency}
- Location: {schedule.appliance.location if schedule.appliance else 'Home'}
- Notes: {schedule.notes or 'Routine scheduled maintenance'}

To mark this service as completed or reschedule, open your HomeCare Hub dashboard:
http://localhost:3000/

Best regards,
HomeCare Hub Service Notifications
"""

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }}
        .logo {{ width: 36px; height: 36px; border-radius: 50%; background: #000000; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; line-height: 36px; text-align: center; }}
        .title {{ font-size: 20px; font-weight: 800; color: #000000; margin: 0; }}
        .tagline {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }}
        .badge {{ display: inline-block; padding: 6px 12px; border-radius: 9999px; color: #ffffff; background-color: {badge_color}; font-weight: 700; font-size: 12px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }}
        h1 {{ font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }}
        p {{ font-size: 14px; line-height: 1.6; color: #4b5563; }}
        .detail-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
        .detail-row {{ display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #edf2f7; }}
        .detail-row:last-child {{ border-bottom: none; }}
        .detail-label {{ color: #64748b; font-weight: 600; }}
        .detail-value {{ color: #0f172a; font-weight: 700; }}
        .btn {{ display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 16px; }}
        .footer {{ font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">H</div>
          <div>
            <div class="title">HomeCare Hub</div>
            <div class="tagline">Maintenance & Service Alerts</div>
          </div>
        </div>
        <div class="badge">{'⚠️ Service Due Today' if is_today else '📅 Upcoming Service'}</div>
        <h1>Service for {appliance_name}</h1>
        <p>Hello {name}, your service for the <strong>{appliance_name}</strong> {time_text}.</p>
        
        <div class="detail-card">
          <div class="detail-row"><span class="detail-label">Appliance</span><span class="detail-value">{appliance_name} {f"({brand_model})" if brand_model else ""}</span></div>
          <div class="detail-row"><span class="detail-label">Service Type</span><span class="detail-value">{schedule.service_type}</span></div>
          <div class="detail-row"><span class="detail-label">Scheduled Date</span><span class="detail-value">{date_str}</span></div>
          <div class="detail-row"><span class="detail-label">Frequency</span><span class="detail-value">{schedule.frequency}</span></div>
          {f'<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">{schedule.notes}</span></div>' if schedule.notes else ''}
        </div>

        <a href="http://localhost:3000/" class="btn">View & Mark Completed →</a>

        <div class="footer">
          Notification sent to {user.email}. Manage reminders in HomeCare Hub.
        </div>
      </div>
    </body>
    </html>
    """

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Service reminder email sent to {user.email} for {appliance_name}")
        return True
    except Exception as e:
        logger.error(f"Error sending service email to {user.email}: {e}")
        return False


def send_warranty_expiry_email(user, warranty, is_today=False):
    """
    Send an email reminder for warranty expiration.
    Matches user format: 'the warranty day of the [Appliance] product is ending today...'
    """
    if not user.email:
        logger.warning(f"User {user.username} has no email address. Skipping warranty email.")
        return False

    appliance_name = warranty.appliance.name if warranty.appliance else "Appliance"
    brand_model = f"{warranty.appliance.brand} {warranty.appliance.model_number}".strip() if warranty.appliance else ""
    date_str = str(warranty.end_date)
    name = user.first_name or user.username

    if is_today:
        subject = f"🛡️ Warranty Notice: The warranty for your {appliance_name} is ending today!"
        time_text = "is ENDING TODAY"
        badge_color = "#dc2626"
    else:
        subject = f"⚠️ Warranty Alert: The warranty for your {appliance_name} is ending on {date_str}"
        time_text = f"is ending on {date_str}"
        badge_color = "#d97706"

    plain_message = f"""Hello {name},

This is an important alert that the warranty coverage for your {appliance_name} {brand_model} {time_text}.

Warranty Details:
- Appliance: {appliance_name} ({brand_model})
- Expiry Date: {date_str}
- Provider: {warranty.provider}
- Warranty Plan: {warranty.warranty_type}
- Status: {warranty.status}
- Terms: {warranty.terms or 'Standard terms apply'}

If you need to file an end-of-warranty inspection or claim, please do so before the coverage expires.
Check your documents and claims on HomeCare Hub:
http://localhost:3000/

Best regards,
HomeCare Hub Warranty Monitoring
"""

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }}
        .logo {{ width: 36px; height: 36px; border-radius: 50%; background: #000000; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; line-height: 36px; text-align: center; }}
        .title {{ font-size: 20px; font-weight: 800; color: #000000; margin: 0; }}
        .tagline {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }}
        .badge {{ display: inline-block; padding: 6px 12px; border-radius: 9999px; color: #ffffff; background-color: {badge_color}; font-weight: 700; font-size: 12px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }}
        h1 {{ font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }}
        p {{ font-size: 14px; line-height: 1.6; color: #4b5563; }}
        .detail-card {{ background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 18px; margin: 20px 0; }}
        .detail-row {{ display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #fef9c3; }}
        .detail-row:last-child {{ border-bottom: none; }}
        .detail-label {{ color: #854d0e; font-weight: 600; }}
        .detail-value {{ color: #713f12; font-weight: 700; }}
        .btn {{ display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 16px; }}
        .footer {{ font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">H</div>
          <div>
            <div class="title">HomeCare Hub</div>
            <div class="tagline">Warranty Vault Alerts</div>
          </div>
        </div>
        <div class="badge">{'🚨 Warranty Ending Today' if is_today else '🛡️ Warranty Expiring Soon'}</div>
        <h1>Warranty for {appliance_name}</h1>
        <p>Hello {name}, the warranty coverage for your <strong>{appliance_name}</strong> {time_text}.</p>
        
        <div class="detail-card">
          <div class="detail-row"><span class="detail-label">Appliance</span><span class="detail-value">{appliance_name} {f"({brand_model})" if brand_model else ""}</span></div>
          <div class="detail-row"><span class="detail-label">Warranty Provider</span><span class="detail-value">{warranty.provider}</span></div>
          <div class="detail-row"><span class="detail-label">Coverage Type</span><span class="detail-value">{warranty.warranty_type}</span></div>
          <div class="detail-row"><span class="detail-label">Expiration Date</span><span class="detail-value">{date_str}</span></div>
          {f'<div class="detail-row"><span class="detail-label">Coverage Terms</span><span class="detail-value">{warranty.terms}</span></div>' if warranty.terms else ''}
        </div>

        <a href="http://localhost:3000/" class="btn">View Documents & Warranty →</a>

        <div class="footer">
          Notification sent to {user.email}. Manage appliances in HomeCare Hub.
        </div>
      </div>
    </body>
    </html>
    """

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Warranty alert email sent to {user.email} for {appliance_name}")
        return True
    except Exception as e:
        logger.error(f"Error sending warranty email to {user.email}: {e}")
        return False


def check_and_send_due_emails_for_user(user):
    """
    Checks all active service schedules and warranties for the user.
    If any service is due today or in the next 7 days, or warranty ending today / expiring soon:
    Sends formatted notification emails to user's registered email.
    """
    if not user.email:
        return {'status': 'error', 'message': 'No email address registered for user.', 'emails_sent': 0}

    from .models import ServiceSchedule, Warranty, Reminder
    today = timezone.now().date()
    seven_days = today + datetime.timedelta(days=7)
    emails_sent = 0
    results = []

    # 1. Check Service Schedules
    schedules = ServiceSchedule.objects.filter(user=user, status='Pending')
    for s in schedules:
        if s.next_service_date == today:
            sent = send_service_reminder_email(user, s, is_today=True)
            if sent:
                emails_sent += 1
                results.append(f"Service reminder (Today) sent for {s.appliance.name}")
                # Create or update reminder
                Reminder.objects.get_or_create(
                    user=user,
                    appliance=s.appliance,
                    due_date=today,
                    reminder_type='Upcoming Service',
                    defaults={
                        'title': f"{s.appliance.name} Service Due Today",
                        'message': f"Your {s.service_type} for {s.appliance.name} is scheduled for today ({today}).",
                        'is_read': False
                    }
                )
        elif today < s.next_service_date <= seven_days:
            sent = send_service_reminder_email(user, s, is_today=False)
            if sent:
                emails_sent += 1
                results.append(f"Upcoming service reminder sent for {s.appliance.name} (Due: {s.next_service_date})")
                Reminder.objects.get_or_create(
                    user=user,
                    appliance=s.appliance,
                    due_date=s.next_service_date,
                    reminder_type='Upcoming Service',
                    defaults={
                        'title': f"{s.appliance.name} Service Reminder",
                        'message': f"Your {s.service_type} for {s.appliance.name} is due on {s.next_service_date}.",
                        'is_read': False
                    }
                )

    # 2. Check Warranties
    warranties = Warranty.objects.filter(user=user)
    for w in warranties:
        if w.end_date == today:
            sent = send_warranty_expiry_email(user, w, is_today=True)
            if sent:
                emails_sent += 1
                results.append(f"Warranty expiry alert (Today) sent for {w.appliance.name}")
                Reminder.objects.get_or_create(
                    user=user,
                    appliance=w.appliance,
                    due_date=today,
                    reminder_type='Warranty Expiry',
                    defaults={
                        'title': f"{w.appliance.name} Warranty Expires Today",
                        'message': f"The {w.warranty_type} for {w.appliance.name} ends today ({today}).",
                        'is_read': False
                    }
                )
        elif today < w.end_date <= (today + datetime.timedelta(days=30)):
            sent = send_warranty_expiry_email(user, w, is_today=False)
            if sent:
                emails_sent += 1
                results.append(f"Warranty expiry alert sent for {w.appliance.name} (Ends: {w.end_date})")
                Reminder.objects.get_or_create(
                    user=user,
                    appliance=w.appliance,
                    due_date=w.end_date,
                    reminder_type='Warranty Expiry',
                    defaults={
                        'title': f"{w.appliance.name} Warranty Expiring Soon",
                        'message': f"The warranty for {w.appliance.name} will expire on {w.end_date}.",
                        'is_read': False
                    }
                )

    return {
        'status': 'success',
        'recipient': user.email,
        'emails_sent': emails_sent,
        'details': results
    }
