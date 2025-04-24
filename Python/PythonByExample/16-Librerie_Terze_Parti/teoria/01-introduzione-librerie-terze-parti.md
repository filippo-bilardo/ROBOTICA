# Introduzione alle Librerie di Terze Parti in Python

## Cosa sono le librerie di terze parti?

Le librerie di terze parti in Python sono pacchetti software sviluppati dalla comunità che estendono le funzionalità del linguaggio oltre quelle offerte dalla libreria standard. Queste librerie permettono agli sviluppatori di risolvere problemi specifici senza dover "reinventare la ruota", sfruttando codice già testato e ottimizzato.

A differenza della libreria standard, che viene distribuita insieme all'interprete Python, le librerie di terze parti devono essere installate separatamente.

## Perché usare librerie di terze parti?

- **Risparmio di tempo**: Implementare funzionalità complesse da zero richiede molto tempo e risorse
- **Affidabilità**: Le librerie popolari sono testate da migliaia di sviluppatori
- **Ottimizzazione**: Molte librerie sono ottimizzate per prestazioni elevate, spesso con parti critiche scritte in C
- **Comunità attiva**: Le librerie più utilizzate hanno una vasta comunità che fornisce supporto e documentazione
- **Specializzazione**: Esistono librerie specializzate per quasi ogni ambito applicativo

## Come installare le librerie di terze parti

Python utilizza un gestore di pacchetti chiamato `pip` per installare, aggiornare e rimuovere le librerie di terze parti. Ecco i comandi principali:

```python
# Installare una libreria
pip install nome_libreria

# Installare una versione specifica
pip install nome_libreria==1.2.3

# Aggiornare una libreria
pip install --upgrade nome_libreria

# Disinstallare una libreria
pip uninstall nome_libreria

# Visualizzare le librerie installate
pip list
```

### Ambienti virtuali

È una buona pratica utilizzare ambienti virtuali per isolare le dipendenze di progetti diversi. Gli ambienti virtuali permettono di avere versioni diverse delle stesse librerie per progetti differenti.

```python
# Creare un ambiente virtuale
python -m venv mio_ambiente

# Attivare l'ambiente virtuale (Windows)
mio_ambiente\Scripts\activate

# Attivare l'ambiente virtuale (Linux/Mac)
source mio_ambiente/bin/activate

# Disattivare l'ambiente virtuale
deactivate
```

### File requirements.txt

Per condividere le dipendenze di un progetto, è comune utilizzare un file `requirements.txt` che elenca tutte le librerie necessarie:

```
# Esempio di requirements.txt
requests==2.28.1
pandas>=1.5.0
numpy
```

Per installare tutte le dipendenze elencate:

```python
pip install -r requirements.txt
```

## Python Package Index (PyPI)

La maggior parte delle librerie di terze parti è disponibile su [PyPI](https://pypi.org/), il repository ufficiale dei pacchetti Python. PyPI ospita più di 400.000 progetti, rendendo facile trovare librerie per quasi ogni esigenza.

## Considerazioni sulla sicurezza

Quando si utilizzano librerie di terze parti, è importante considerare:

- **Affidabilità della fonte**: Preferire librerie ben mantenute e con molte stelle su GitHub
- **Aggiornamenti di sicurezza**: Mantenere le librerie aggiornate per evitare vulnerabilità note
- **Licenze**: Verificare che la licenza della libreria sia compatibile con il proprio progetto

## Navigazione

- [Torna alla pagina principale](../../README.md)
- [Torna all'indice della sezione](../README.md)
- [Prossima lezione: Requests](./02-requests.md)