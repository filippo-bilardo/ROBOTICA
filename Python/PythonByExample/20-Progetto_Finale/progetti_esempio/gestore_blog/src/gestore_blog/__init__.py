# src/gestore_blog/__init__.py

from flask import Flask
# Importa configurazioni, estensioni, blueprint, ecc.

# Esempio di inizializzazione base di Flask
def create_app(config_filename=None):
    app = Flask(__name__, instance_relative_config=True)

    # Carica la configurazione (da config.py o variabili d'ambiente)
    # app.config.from_pyfile(config_filename)

    # Inizializza estensioni (es. SQLAlchemy, Migrate)
    # db.init_app(app)
    # migrate.init_app(app, db)

    # Registra i Blueprint (viste)
    # from . import views
    # app.register_blueprint(views.bp)

    @app.route('/hello')
    def hello():
        return 'Hello, World from Gestore Blog!'

    return app