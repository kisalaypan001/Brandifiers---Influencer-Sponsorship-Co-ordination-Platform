from run import create_celery, create_app
from tasks import send_daily_reminders, generate_monthly_report

app, celery_app = create_app()

celery = create_celery(app)

celery.autodiscover_tasks(['tasks'])
