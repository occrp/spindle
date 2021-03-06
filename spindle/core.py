import os
import yaml
import logging
from logging.handlers import SMTPHandler

from flask import Flask, current_app
from flask.ext.assets import Environment
from flask_oauthlib.client import OAuth
from werkzeug.contrib.cache import SimpleCache

from loom.config import Config
from loom.indexer import Indexer
from spindle import default_settings

assets = Environment()
cache = SimpleCache(default_timeout=3600)
oauth = OAuth()
oauth_provider = oauth.remote_app('provider', app_key='OAUTH')


def load_local_schema(resolver, schema_dir=None):
    if schema_dir is None:
        schema_dir = os.path.join(os.path.dirname(__file__), 'schema')
    for schema_file in os.listdir(schema_dir):
        with open(os.path.join(schema_dir, schema_file), 'r') as fh:
            schema = yaml.load(fh)
            if 'id' in schema:
                resolver.store[schema['id']] = schema


def create_app(config={}):
    app = Flask('spindle')
    app.config.from_object(default_settings)
    app.config.from_envvar('SPINDLE_SETTINGS', silent=True)
    app.config.update(config)

    config = {
        'schemas': app.config.get('SCHEMAS'),
        'database': app.config.get('DATABASE_URI'),
        'elastic_host': app.config.get('ELASTICSEARCH_HOST'),
        'elastic_index': app.config.get('ELASTICSEARCH_INDEX')
    }
    app.loom_config = Config(config)
    load_local_schema(app.loom_config.resolver)
    app.loom_config.setup()

    assets.init_app(app)
    oauth.init_app(app)

    if not app.debug and app.config.get('MAIL_ADMINS'):
        app_name = app.config.get('APP_NAME')
        credentials = app.config.get('MAIL_CREDENTIALS', ())
        mail_handler = SMTPHandler(app.config.get('MAIL_HOST'),
                                   app.config.get('MAIL_FROM'),
                                   app.config.get('MAIL_ADMINS'),
                                   '%s crash report' % app_name,
                                   credentials=credentials,
                                   secure=())
        mail_handler.setLevel(logging.ERROR)
        app.logger.addHandler(mail_handler)
    return app


def get_es():
    return current_app.loom_config.elastic_client


def get_es_index():
    return current_app.loom_config.elastic_index


def get_loom_config():
    return current_app.loom_config


def get_loom_indexer():
    if not hasattr(current_app, 'loom_indexer'):
        current_app.loom_indexer = Indexer(get_loom_config())
    return current_app.loom_indexer
