# setup.py

from setuptools import setup, find_packages

setup(
    name='gioco_pygame',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'pygame>=2.0.0',
    ],
    entry_points={
        'console_scripts': [
            'gioco_pygame=main:main',
        ],
    },
    author='Il Tuo Nome',
    author_email='tua@email.com',
    description='Un semplice gioco 2D realizzato con Pygame.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='URL_DEL_TUO_PROGETTO', # Sostituisci con l'URL del tuo repository
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)