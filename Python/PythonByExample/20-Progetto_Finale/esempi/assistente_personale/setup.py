from setuptools import setup, find_packages

setup(
    name='assistente_personale',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        # Aggiungi qui le dipendenze
    ],
    entry_points={
        'console_scripts': [
            'assistente=assistente_personale.core:main',
        ],
    },
    author='Il Tuo Nome',
    author_email='tua@email.com',
    description='Un semplice assistente personale da riga di comando.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='URL_DEL_TUO_PROGETTO',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)