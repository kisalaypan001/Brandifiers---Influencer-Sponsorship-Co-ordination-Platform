from celery import Celery, Task
class CeleryConfig:
    BROKER_URL = 'redis://127.0.0.1:6379/0'
    RESULT_BACKEND = 'redis://127.0.0.1:6379/1'
    TIMEZONE = 'Asia/Kolkata'

def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.import_name, task_cls=FlaskTask)
    celery_app.config_from_object(CeleryConfig)
    celery_app.conf.broker_connection_retry_on_startup = True
    return celery_app
