#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup script per il Sistema di Gestione Biblioteca.

Questo script permette di installare il pacchetto sistema_biblioteca
come un pacchetto Python standard.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="sistema_biblioteca",
    version="0.1.0",
    author="Corso Python by Example",
    author_email="info@pythonbyexample.it",
    description="Sistema di gestione per una piccola biblioteca",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/pythonbyexample/sistema_biblioteca",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=[
        # Dipendenze del progetto
    ],
    entry_points={
        "console_scripts": [
            "biblioteca=sistema_biblioteca.main:main",
        ],
    },
)