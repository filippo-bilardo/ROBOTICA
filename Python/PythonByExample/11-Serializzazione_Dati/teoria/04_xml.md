# Serializzazione con XML

In questa lezione, esploreremo la serializzazione e deserializzazione di dati utilizzando XML (eXtensible Markup Language) in Python. XML è un formato di markup flessibile che consente di rappresentare strutture dati complesse in modo gerarchico.

## Cos'è XML?

XML (eXtensible Markup Language) è un linguaggio di markup che definisce un insieme di regole per codificare documenti in un formato leggibile sia dagli umani che dalle macchine. Le caratteristiche principali di XML sono:

- **Estensibilità**: Permette di definire tag personalizzati
- **Struttura gerarchica**: Organizza i dati in una struttura ad albero
- **Autodescrivente**: I tag descrivono il contenuto che racchiudono
- **Separazione di dati e presentazione**: XML descrive i dati, non come visualizzarli
- **Supporto per metadati**: Attraverso attributi e namespace

Un documento XML è composto da:

- **Elementi**: Definiti da tag di apertura e chiusura (es. `<nome>Mario</nome>`)
- **Attributi**: Coppie nome-valore all'interno dei tag (es. `<persona id="1">...</persona>`)
- **Testo**: Contenuto degli elementi
- **Commenti**: Annotazioni nel documento (es. `<!-- Questo è un commento -->`)
- **Dichiarazioni**: Come la dichiarazione XML (`<?xml version="1.0" encoding="UTF-8"?>`)

## Librerie XML in Python

Python offre diverse librerie per lavorare con XML:

1. **xml.etree.ElementTree**: Libreria leggera e facile da usare (parte della libreria standard)
2. **xml.dom.minidom**: Implementazione minimale del DOM (Document Object Model)
3. **xml.sax**: API per il parsing XML basato su eventi
4. **lxml**: Libreria esterna più potente e conforme agli standard (richiede installazione)

In questa lezione, ci concentreremo principalmente su `xml.etree.ElementTree`, che offre un buon equilibrio tra semplicità e funzionalità.

## Serializzazione con ElementTree

### Creazione di un Documento XML

```python
import xml.etree.ElementTree as ET

# Creazione dell'elemento radice
radice = ET.Element("rubrica")

# Aggiunta di un contatto
contatto1 = ET.SubElement(radice, "contatto")
contatto1.set("id", "1")  # Aggiunta di un attributo
ET.SubElement(contatto1, "nome").text = "Mario"
ET.SubElement(contatto1, "cognome").text = "Rossi"
ET.SubElement(contatto1, "email").text = "mario.rossi@example.com"

# Aggiunta di un altro contatto con numeri di telefono
contatto2 = ET.SubElement(radice, "contatto")
contatto2.set("id", "2")
ET.SubElement(contatto2, "nome").text = "Laura"
ET.SubElement(contatto2, "cognome").text = "Bianchi"
ET.SubElement(contatto2, "email").text = "laura.bianchi@example.com"

# Aggiunta di numeri di telefono come sottoelementi
telefoni = ET.SubElement(contatto2, "telefoni")
ET.SubElement(telefoni, "telefono", tipo="casa").text = "02-1234567"
ET.SubElement(telefoni, "telefono", tipo="cellulare").text = "333-1234567"

# Creazione dell'albero XML
albero = ET.ElementTree(radice)

# Scrittura su file con indentazione
def indent(elem, level=0):
    i = "\n" + level*"  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for elem in elem:
            indent(elem, level+1)
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i

indent(radice)

# Salvataggio su file
albero.write("rubrica.xml", encoding="utf-8", xml_declaration=True)

# Stampa del contenuto XML come stringa
xml_string = ET.tostring(radice, encoding="utf-8", method="xml").decode("utf-8")
print(xml_string)
```

Il file XML generato (`rubrica.xml`) avrà un aspetto simile a questo:

```xml
<?xml version='1.0' encoding='utf-8'?>
<rubrica>
  <contatto id="1">
    <nome>Mario</nome>
    <cognome>Rossi</cognome>
    <email>mario.rossi@example.com</email>
  </contatto>
  <contatto id="2">
    <nome>Laura</nome>
    <cognome>Bianchi</cognome>
    <email>laura.bianchi@example.com</email>
    <telefoni>
      <telefono tipo="casa">02-1234567</telefono>
      <telefono tipo="cellulare">333-1234567</telefono>
    </telefoni>
  </contatto>
</rubrica>
```

### Deserializzazione con ElementTree

```python
import xml.etree.ElementTree as ET

# Parsing da file
try:
    albero = ET.parse("rubrica.xml")
    radice = albero.getroot()
except ET.ParseError as e:
    print(f"Errore nel parsing del file XML: {e}")
    exit(1)

# Parsing da stringa
# xml_string = "<rubrica><contatto id=\"1\"><nome>Mario</nome></contatto></rubrica>"
# radice = ET.fromstring(xml_string)

# Accesso agli elementi
print(f"Elemento radice: {radice.tag}")
print(f"Numero di contatti: {len(radice)}")

# Iterazione sugli elementi figli
for contatto in radice.findall("contatto"):
    id_contatto = contatto.get("id")
    nome = contatto.find("nome").text
    cognome = contatto.find("cognome").text
    email = contatto.find("email").text
    
    print(f"\nContatto ID: {id_contatto}")
    print(f"Nome completo: {nome} {cognome}")
    print(f"Email: {email}")
    
    # Gestione di elementi opzionali
    telefoni = contatto.find("telefoni")
    if telefoni is not None:
        print("Numeri di telefono:")
        for telefono in telefoni.findall("telefono"):
            tipo = telefono.get("tipo")
            numero = telefono.text
            print(f"  - {tipo}: {numero}")
```

## Ricerca di Elementi con XPath

ElementTree supporta una versione semplificata di XPath per la ricerca di elementi:

```python
import xml.etree.ElementTree as ET

# Parsing del file XML
albero = ET.parse("rubrica.xml")
radice = albero.getroot()

# Esempi di ricerca con XPath

# Trova tutti i contatti
contatti = radice.findall("./contatto")
print(f"Numero totale di contatti: {len(contatti)}")

# Trova il contatto con ID=2
contatto = radice.find("./contatto[@id='2']")
if contatto is not None:
    print(f"Contatto trovato: {contatto.find('nome').text} {contatto.find('cognome').text}")

# Trova tutti i numeri di telefono cellulare
cellulari = radice.findall(".//telefono[@tipo='cellulare']")
for cellulare in cellulari:
    print(f"Numero cellulare: {cellulare.text}")

# Trova tutti i nomi
nomi = radice.findall(".//nome")
print("Nomi trovati:")
for nome in nomi:
    print(f"  - {nome.text}")
```

## Modifica di Documenti XML

```python
import xml.etree.ElementTree as ET

# Parsing del file XML
albero = ET.parse("rubrica.xml")
radice = albero.getroot()

# Modifica di un elemento esistente
for contatto in radice.findall("./contatto"):
    if contatto.find("nome").text == "Mario":
        contatto.find("email").text = "nuovo.mario@example.com"

# Aggiunta di un nuovo elemento
nuovo_contatto = ET.SubElement(radice, "contatto")
nuovo_contatto.set("id", "3")
ET.SubElement(nuovo_contatto, "nome").text = "Giuseppe"
ET.SubElement(nuovo_contatto, "cognome").text = "Verdi"
ET.SubElement(nuovo_contatto, "email").text = "giuseppe.verdi@example.com"

# Rimozione di un elemento
for contatto in radice.findall("./contatto"):
    if contatto.find("nome").text == "Laura":
        radice.remove(contatto)

# Salvataggio delle modifiche
albero.write("rubrica_modificata.xml", encoding="utf-8", xml_declaration=True)
```

## Utilizzo di minidom per una Formattazione Migliore

```python
import xml.etree.ElementTree as ET
import xml.dom.minidom

# Creazione di un documento XML con ElementTree
radice = ET.Element("configurazione")
ET.SubElement(radice, "versione").text = "1.0"

database = ET.SubElement(radice, "database")
ET.SubElement(database, "host").text = "localhost"
ET.SubElement(database, "porta").text = "5432"
ET.SubElement(database, "nome").text = "myapp_db"
ET.SubElement(database, "utente").text = "admin"

log = ET.SubElement(radice, "logging")
log.set("abilitato", "true")
ET.SubElement(log, "livello").text = "INFO"
ET.SubElement(log, "file").text = "app.log"

# Conversione in stringa XML
xml_grezzo = ET.tostring(radice, encoding="utf-8")

# Utilizzo di minidom per formattare il documento
dom = xml.dom.minidom.parseString(xml_grezzo)
xml_formattato = dom.toprettyxml(indent="  ")

# Salvataggio su file
with open("configurazione.xml", "w", encoding="utf-8") as file:
    file.write(xml_formattato)

print(xml_formattato)
```

## Gestione di Namespace XML

I namespace XML permettono di evitare conflitti tra elementi con lo stesso nome:

```python
import xml.etree.ElementTree as ET

# Definizione dei namespace
ns_libro = {"libro": "http://example.org/namespace/libro"}
ns_autore = {"autore": "http://example.org/namespace/autore"}

# Creazione di un documento con namespace
ET.register_namespace("", "http://example.org/namespace/libro")
ET.register_namespace("autore", "http://example.org/namespace/autore")

radice = ET.Element("{http://example.org/namespace/libro}biblioteca")

libro = ET.SubElement(radice, "{http://example.org/namespace/libro}libro")
libro.set("id", "1")
ET.SubElement(libro, "{http://example.org/namespace/libro}titolo").text = "Il Nome della Rosa"
ET.SubElement(libro, "{http://example.org/namespace/libro}anno").text = "1980"

autore = ET.SubElement(libro, "{http://example.org/namespace/autore}autore")
ET.SubElement(autore, "{http://example.org/namespace/autore}nome").text = "Umberto"
ET.SubElement(autore, "{http://example.org/namespace/autore}cognome").text = "Eco"

# Salvataggio su file
albero = ET.ElementTree(radice)
albero.write("biblioteca.xml", encoding="utf-8", xml_declaration=True)

# Parsing di un documento con namespace
albero = ET.parse("biblioteca.xml")
radice = albero.getroot()

# Ricerca con namespace
titoli = radice.findall(".//libro:titolo", ns_libro)
for titolo in titoli:
    print(f"Titolo: {titolo.text}")

autori = radice.findall(".//autore:cognome", ns_autore)
for autore in autori:
    print(f"Autore: {autore.text}")
```

## Validazione XML con Schema (XSD)

Per validare un documento XML contro uno schema XSD, possiamo utilizzare la libreria `lxml`:

```python
from lxml import etree

# Schema XSD
xsd_schema = """
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="rubrica">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="contatto" maxOccurs="unbounded">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="nome" type="xs:string"/>
              <xs:element name="cognome" type="xs:string"/>
              <xs:element name="email" type="xs:string"/>
              <xs:element name="telefoni" minOccurs="0">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="telefono" maxOccurs="unbounded">
                      <xs:complexType>
                        <xs:simpleContent>
                          <xs:extension base="xs:string">
                            <xs:attribute name="tipo" type="xs:string" use="required"/>
                          </xs:extension>
                        </xs:simpleContent>
                      </xs:complexType>
                    </xs:element>
                  </xs:sequence>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
            <xs:attribute name="id" type="xs:string" use="required"/>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
"""

# Documento XML da validare
xml_doc = """
<?xml version="1.0" encoding="UTF-8"?>
<rubrica>
  <contatto id="1">
    <nome>Mario</nome>
    <cognome>Rossi</cognome>
    <email>mario.rossi@example.com</email>
  </contatto>
  <contatto id="2">
    <nome>Laura</nome>
    <cognome>Bianchi</cognome>
    <email>laura.bianchi@example.com</email>
    <telefoni>
      <telefono tipo="casa">02-1234567</telefono>
      <telefono tipo="cellulare">333-1234567</telefono>
    </telefoni>
  </contatto>
</rubrica>
"""

try:
    # Parsing dello schema XSD
    schema_root = etree.XML(xsd_schema)
    schema = etree.XMLSchema(schema_root)
    
    # Parsing del documento XML
    parser = etree.XMLParser(schema=schema)
    root = etree.fromstring(xml_doc, parser)
    
    print("Il documento XML è valido secondo lo schema XSD.")
except etree.XMLSyntaxError as e:
    print(f"Errore di sintassi XML: {e}")
except etree.DocumentInvalid as e:
    print(f"Documento XML non valido: {e}")
```

## Confronto tra XML e JSON

Ecco un confronto tra XML e JSON per la rappresentazione degli stessi dati:

### Rappresentazione in XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persona>
  <nome>Mario</nome>
  <cognome>Rossi</cognome>
  <età>35</età>
  <indirizzo>
    <via>Via Roma 123</via>
    <città>Milano</città>
    <cap>20100</cap>
  </indirizzo>
  <interessi>
    <interesse>programmazione</interesse>
    <interesse>musica</interesse>
    <interesse>sport</interesse>
  </interessi>
</persona>
```

### Rappresentazione in JSON

```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "età": 35,
  "indirizzo": {
    "via": "Via Roma 123",
    "città": "Milano",
    "cap": "20100"
  },
  "interessi": ["programmazione", "musica", "sport"]
}
```

### Confronto

| Caratteristica | XML | JSON |
|---------------|-----|------|
| Verbosità | Più verboso | Più conciso |
| Leggibilità | Buona, ma più complessa | Eccellente |
| Metadati | Supporto nativo (attributi) | Limitato |
| Tipi di dati | Limitati (tutto è testo) | Supporto per tipi base |
| Namespace | Supporto nativo | Non supportati |
| Schema/Validazione | Supporto completo (XSD) | Supporto limitato (JSON Schema) |
| Parsing | Più complesso | Più semplice |
| Dimensione | File più grandi | File più piccoli |
| Uso comune | Configurazioni complesse, SOAP, documenti | API REST, configurazioni semplici |

## Esempio Pratico: Esportazione di Dati in Formato XML

```python
import xml.etree.ElementTree as ET
import xml.dom.minidom
import datetime

class XMLExporter:
    def __init__(self, root_element="data"):
        self.root = ET.Element(root_element)
    
    def add_element(self, parent, tag, text=None, attributes=None):
        """Aggiunge un elemento XML con testo e attributi opzionali."""
        element = ET.SubElement(parent, tag)
        if text is not None:
            element.text = str(text)
        if attributes:
            for key, value in attributes.items():
                element.set(key, str(value))
        return element
    
    def dict_to_xml(self, data, parent=None, item_tag="item"):
        """Converte un dizionario in elementi XML."""
        if parent is None:
            parent = self.root
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    sub_element = self.add_element(parent, key)
                    self.dict_to_xml(value, sub_element, item_tag)
                else:
                    self.add_element(parent, key, value)
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    sub_element = self.add_element(parent, item_tag)
                    self.dict_to_xml(item, sub_element, item_tag)
                else:
                    self.add_element(parent, item_tag, item)
        return parent
    
    def to_string(self, pretty=True):
        """Converte l'XML in una stringa, opzionalmente formattata."""
        xml_string = ET.tostring(self.root, encoding="utf-8")
        if pretty:
            dom = xml.dom.minidom.parseString(xml_string)
            return dom.toprettyxml(indent="  ", encoding="utf-8").decode("utf-8")
        return xml_string.decode("utf-8")
    
    def save(self, filename, pretty=True):
        """Salva l'XML su file, opzionalmente formattato."""
        with open(filename, "w", encoding="utf-8") as file:
            file.write(self.to_string(pretty))

# Esempio di utilizzo
def export_students_to_xml():
    # Dati di esempio
    students = [
        {
            "id": 1,
            "name": "Mario Rossi",
            "age": 22,
            "courses": [
                {"code": "CS101", "name": "Introduzione alla Programmazione", "grade": 28},
                {"code": "CS102", "name": "Algoritmi e Strutture Dati", "grade": 30}
            ],
            "active": True
        },
        {
            "id": 2,
            "name": "Laura Bianchi",
            "age": 21,
            "courses": [
                {"code": "CS101", "name": "Introduzione alla Programmazione", "grade": 30},
                {"code": "CS103", "name": "Database", "grade": 27}
            ],
            "active": True
        }
    ]
    
    # Creazione dell'esportatore XML
    exporter = XMLExporter("students")
    
    # Aggiunta di metadati
    exporter.add_element(exporter.root, "metadata", attributes={
        "generated": datetime.datetime.now().isoformat(),
        "count": str(len(students))
    })
    
    # Conversione dei dati in XML
    exporter.dict_to_xml({"student_list": students}, item_tag="student")
    
    # Salvataggio su file
    exporter.save("students.xml")
    
    print("File XML creato con successo!")
    print(exporter.to_string())

# Per eseguire l'esempio, decommentare la riga seguente
# export_students_to_xml()
```

## Conclusione

XML è un formato di serializzazione potente e flessibile, particolarmente adatto per rappresentare dati strutturati gerarchicamente e con metadati complessi. Sebbene sia più verboso rispetto a JSON, offre funzionalità avanzate come namespace, schemi di validazione e supporto per documenti complessi.

Python offre diverse librerie per lavorare con XML, dalla semplice `xml.etree.ElementTree` nella libreria standard alla più potente `lxml` come libreria esterna. La scelta della libreria dipende dalle esigenze specifiche del progetto e dalla complessità dei documenti XML da gestire.

Nella prossima lezione, esploreremo YAML, un formato di serializzazione human-friendly particolarmente adatto per file di configurazione.

---

[Indice](../README.md) | [Lezione Precedente: Serializzazione con JSON](03_json.md) | [Prossima Lezione: Serializzazione con YAML](05_yaml.md)