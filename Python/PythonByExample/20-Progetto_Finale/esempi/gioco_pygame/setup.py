# setup.py
from setuptools import setup, find_packages

setup(
    name='gioco_pygame_esempio',
    version='0.1.0',
    author='Il Tuo Nome',
    author_email='tua@email.com',
    description='Un semplice gioco platform 2D realizzato con Pygame.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='URL_DEL_TUO_REPOSITORY', # Sostituisci con l'URL del tuo repo se disponibile
    packages=find_packages(exclude=['tests*']),
    install_requires=[
        'pygame>=2.0.0',
        # Aggiungere altre dipendenze qui
    ],
    entry_points={
        'console_scripts': [
            'gioco_pygame=main:main', # Assumendo che la funzione main sia in main.py
        ],
    },
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License', # Scegli la licenza appropriata
        'Operating System :: OS Independent',
        'Topic :: Games/Entertainment',
    ],
    python_requires='>=3.6',
    include_package_data=True, # Include file non-codice specificati in MANIFEST.in
    # package_data={'nome_pacchetto': ['assets/*/*']}, # Esempio per includere assets
)