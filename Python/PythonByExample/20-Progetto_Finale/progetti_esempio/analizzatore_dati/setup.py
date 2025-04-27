from setuptools import setup, find_packages

setup(
    name='analizzatore_dati',
    version='0.1.0',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        # Leggi le dipendenze da requirements.txt o elencale qui
        # Esempio: 'pandas>=1.0.0',
    ],
    entry_points={
        'console_scripts': [
            'analizza-dati=analizzatore_dati.main:main',
        ],
    },
    author='Il Tuo Nome',
    author_email='tua@email.com',
    description='Un semplice analizzatore di dati.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='URL_DEL_TUO_PROGETTO', # Sostituisci con l'URL del tuo repository se applicabile
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License', # Scegli la licenza appropriata
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)