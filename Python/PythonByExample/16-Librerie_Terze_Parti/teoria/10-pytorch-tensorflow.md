# PyTorch e TensorFlow: Librerie per il Machine Learning e l'Intelligenza Artificiale

## Introduzione al Machine Learning in Python

Il machine learning e l'intelligenza artificiale sono campi in rapida evoluzione che richiedono strumenti potenti e flessibili. Python è diventato il linguaggio di riferimento in questi ambiti, grazie anche a librerie come PyTorch e TensorFlow che offrono framework completi per lo sviluppo di modelli di machine learning e deep learning.

## PyTorch

PyTorch è una libreria open source per il machine learning sviluppata principalmente da Facebook (Meta). È nota per la sua flessibilità e approccio dinamico alla costruzione di reti neurali.

### Caratteristiche principali di PyTorch

- **Computazione dinamica del grafo** (define-by-run)
- **API intuitiva e pythonica**
- **Debugging semplificato**
- **Supporto nativo per GPU**
- **Ecosistema ricco** di strumenti e librerie
- **Ottimizzato per la ricerca**

### Installazione di PyTorch

```bash
# CPU only
pip install torch torchvision torchaudio

# Con supporto CUDA (per GPU NVIDIA)
# Visita pytorch.org per il comando specifico per la tua versione di CUDA
```

### Tensori in PyTorch

I tensori sono la struttura dati fondamentale in PyTorch, simili agli array NumPy ma con supporto per l'accelerazione GPU.

```python
import torch

# Creazione di tensori
x = torch.tensor([1, 2, 3, 4])
y = torch.zeros(3, 3)  # Matrice 3x3 di zeri
z = torch.randn(2, 3)  # Matrice 2x3 con valori casuali da distribuzione normale

# Operazioni su tensori
a = x + 10  # Somma elemento per elemento
b = torch.matmul(y, z.t())  # Moltiplicazione matriciale

# Trasferimento su GPU (se disponibile)
if torch.cuda.is_available():
    x_gpu = x.cuda()
    # oppure
    x_gpu = x.to('cuda')
```

### Autograd: Differenziazione Automatica

PyTorch include un sistema di differenziazione automatica che permette di calcolare i gradienti necessari per l'addestramento delle reti neurali.

```python
import torch

# Crea tensori con richiesta di calcolo del gradiente
x = torch.ones(2, 2, requires_grad=True)

# Esegui operazioni
y = x * 2
z = y.mean()

# Calcola i gradienti
z.backward()

# Accedi ai gradienti
print(x.grad)  # d(z)/d(x)
```

### Creazione di una Rete Neurale

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class RetinaNet(nn.Module):
    def __init__(self):
        super(RetinaNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(32 * 8 * 8, 128)
        self.fc2 = nn.Linear(128, 10)
        
    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 32 * 8 * 8)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Istanzia il modello
model = RetinaNet()
```

### Addestramento di un Modello

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Preparazione dei dati
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

# Definizione del modello, della funzione di perdita e dell'ottimizzatore
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(28*28, 128),
    nn.ReLU(),
    nn.Linear(128, 10)
)

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)

# Ciclo di addestramento
num_epochs = 5
for epoch in range(num_epochs):
    running_loss = 0.0
    for i, data in enumerate(train_loader, 0):
        inputs, labels = data
        
        # Azzera i gradienti
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        
        # Backward pass e ottimizzazione
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        
    print(f'Epoca {epoch+1}, Loss: {running_loss/len(train_loader):.3f}')

print('Addestramento completato!')
```

### Salvataggio e Caricamento di Modelli

```python
# Salvataggio del modello
torch.save(model.state_dict(), 'model.pth')

# Caricamento del modello
model = RetinaNet()
model.load_state_dict(torch.load('model.pth'))
model.eval()  # Imposta il modello in modalità valutazione
```

## TensorFlow

TensorFlow è una libreria open source per il machine learning sviluppata da Google. È nota per la sua scalabilità e per il supporto alla produzione.

### Caratteristiche principali di TensorFlow

- **Computazione statica del grafo** (con supporto anche per modalità eager)
- **TensorFlow Extended (TFX)** per pipeline ML in produzione
- **TensorBoard** per la visualizzazione dell'addestramento
- **Supporto per dispositivi multipli** (CPU, GPU, TPU)
- **TensorFlow Lite** per dispositivi mobili ed embedded
- **TensorFlow.js** per ML nel browser

### Installazione di TensorFlow

```bash
# Versione base
pip install tensorflow

# Con supporto GPU
# Richiede l'installazione di driver NVIDIA e CUDA
```

### Tensori in TensorFlow

```python
import tensorflow as tf

# Creazione di tensori
x = tf.constant([1, 2, 3, 4])
y = tf.zeros([3, 3])  # Matrice 3x3 di zeri
z = tf.random.normal([2, 3])  # Matrice 2x3 con valori casuali da distribuzione normale

# Operazioni su tensori
a = x + 10  # Somma elemento per elemento
b = tf.matmul(y, tf.transpose(z))  # Moltiplicazione matriciale
```

### Modelli con Keras (API ad alto livello di TensorFlow)

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Definizione del modello sequenziale
model = keras.Sequential([
    layers.Flatten(input_shape=(28, 28)),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(10, activation='softmax')
])

# Compilazione del modello
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
```

### Addestramento di un Modello

```python
import tensorflow as tf

# Caricamento del dataset MNIST
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()

# Normalizzazione dei dati
x_train, x_test = x_train / 255.0, x_test / 255.0

# Addestramento del modello
model.fit(
    x_train, y_train,
    epochs=5,
    batch_size=64,
    validation_data=(x_test, y_test)
)

# Valutazione del modello
test_loss, test_acc = model.evaluate(x_test, y_test)
print(f'Accuratezza sul test set: {test_acc:.3f}')
```

### Modello Funzionale in Keras

```python
import tensorflow as tf
from tensorflow.keras import layers, Model, Input

# Definizione degli input
inputs = Input(shape=(28, 28, 1))

# Definizione del flusso di elaborazione
x = layers.Conv2D(32, 3, activation='relu')(inputs)
x = layers.MaxPooling2D()(x)
x = layers.Conv2D(64, 3, activation='relu')(x)
x = layers.MaxPooling2D()(x)
x = layers.Flatten()(x)
x = layers.Dense(128, activation='relu')(x)
outputs = layers.Dense(10, activation='softmax')(x)

# Creazione del modello
model = Model(inputs=inputs, outputs=outputs)

# Compilazione del modello
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
```

### Salvataggio e Caricamento di Modelli

```python
# Salvataggio del modello completo
model.save('model.h5')

# Caricamento del modello
model = tf.keras.models.load_model('model.h5')

# Salvataggio solo dei pesi
model.save_weights('model_weights.h5')

# Caricamento solo dei pesi
model.load_weights('model_weights.h5')
```

### TensorBoard per il Monitoraggio

```python
import tensorflow as tf
import datetime

# Creazione di un callback per TensorBoard
log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(
    log_dir=log_dir,
    histogram_freq=1
)

# Addestramento con TensorBoard
model.fit(
    x_train, y_train,
    epochs=5,
    validation_data=(x_test, y_test),
    callbacks=[tensorboard_callback]
)
```

## Confronto tra PyTorch e TensorFlow

### Quando usare PyTorch

- **Ricerca e prototipazione**: Grazie alla sua natura dinamica e al debugging semplificato
- **Progetti accademici**: Molto popolare nel mondo della ricerca
- **Quando si preferisce un approccio più "pythonic"**
- **Per progetti che richiedono flessibilità**

### Quando usare TensorFlow

- **Deployment in produzione**: Grazie a TensorFlow Serving e TFX
- **Applicazioni mobili ed embedded**: Con TensorFlow Lite
- **Applicazioni web**: Con TensorFlow.js
- **Quando si ha bisogno di un ecosistema completo**

## Esempio Completo: Classificazione di Immagini

### Con PyTorch

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms

# Preparazione dei dati
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=4, shuffle=True, num_workers=2)

testset = torchvision.datasets.CIFAR10(root='./data', train=False, download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=4, shuffle=False, num_workers=2)

classes = ('aereo', 'automobile', 'uccello', 'gatto', 'cervo', 'cane', 'rana', 'cavallo', 'nave', 'camion')

# Definizione della rete
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = x.view(-1, 16 * 5 * 5)
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

net = Net()

# Definizione della funzione di perdita e dell'ottimizzatore
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)

# Addestramento della rete
for epoch in range(2):  # Esegui il dataset più volte
    running_loss = 0.0
    for i, data in enumerate(trainloader, 0):
        # Ottieni gli input
        inputs, labels = data

        # Azzera i gradienti
        optimizer.zero_grad()

        # Forward + backward + optimize
        outputs = net(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        # Stampa statistiche
        running_loss += loss.item()
        if i % 2000 == 1999:    # Stampa ogni 2000 mini-batch
            print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 2000:.3f}')
            running_loss = 0.0

print('Addestramento completato')

# Salvataggio del modello
torch.save(net.state_dict(), 'cifar_net.pth')
```

### Con TensorFlow/Keras

```python
import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt

# Caricamento e preparazione del dataset CIFAR-10
(train_images, train_labels), (test_images, test_labels) = datasets.cifar10.load_data()

# Normalizzazione dei valori dei pixel tra 0 e 1
train_images, test_images = train_images / 255.0, test_images / 255.0

# Definizione delle classi
class_names = ['aereo', 'automobile', 'uccello', 'gatto', 'cervo',
               'cane', 'rana', 'cavallo', 'nave', 'camion']

# Creazione del modello convoluzionale
model = models.Sequential()
model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))

# Aggiunta di livelli densi in cima
model.add(layers.Flatten())
model.add(layers.Dense(64, activation='relu'))
model.add(layers.Dense(10))

# Compilazione del modello
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

# Addestramento del modello
history = model.fit(
    train_images, train_labels, 
    epochs=10, 
    validation_data=(test_images, test_labels)
)

# Valutazione del modello
test_loss, test_acc = model.evaluate(test_images, test_labels, verbose=2)
print(f'\nAccuratezza sul test set: {test_acc:.3f}')

# Salvataggio del modello
model.save('cifar_model.h5')
```

## Risorse aggiuntive

### PyTorch

- [Documentazione ufficiale di PyTorch](https://pytorch.org/docs/stable/index.html)
- [Tutorial di PyTorch](https://pytorch.org/tutorials/)
- [PyTorch Lightning](https://www.pytorchlightning.ai/) - Framework per semplificare l'addestramento

### TensorFlow

- [Documentazione ufficiale di TensorFlow](https://www.tensorflow.org/api_docs)
- [Tutorial di TensorFlow](https://www.tensorflow.org/tutorials)
- [TensorFlow Hub](https://tfhub.dev/) - Repository di modelli pre-addestrati

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: Django e Flask](09-django-flask.md)