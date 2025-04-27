# Riconoscimento Immagini con Machine Learning

In questo progetto pratico, implementeremo un sistema di riconoscimento delle immagini utilizzando tecniche di machine learning con PyTorch. Questo progetto ti permetterà di applicare concetti avanzati di programmazione Python insieme a librerie specializzate per l'intelligenza artificiale.

## Analisi del problema

Il riconoscimento delle immagini è una delle applicazioni più diffuse del machine learning. In questo progetto, ci concentreremo sulla creazione di un sistema in grado di classificare immagini in diverse categorie.

### Requisiti del progetto

- Sviluppare un modello di machine learning per il riconoscimento di immagini
- Utilizzare un dataset pre-esistente per l'addestramento
- Implementare un'interfaccia semplice per testare il modello
- Valutare le prestazioni del modello con metriche appropriate
- Permettere il salvataggio e il caricamento del modello addestrato

### Tecnologie utilizzate

- **PyTorch**: framework di deep learning per la creazione e l'addestramento del modello
- **Torchvision**: libreria per la gestione di dataset di immagini e modelli pre-addestrati
- **NumPy**: per la manipolazione efficiente dei dati
- **Matplotlib**: per la visualizzazione dei risultati
- **Pillow**: per la gestione delle immagini

## Progettazione

### Architettura del sistema

Il nostro sistema di riconoscimento immagini sarà composto da diversi moduli:

1. **Modulo di preparazione dei dati**: gestisce il caricamento e la preparazione del dataset
2. **Modulo di definizione del modello**: contiene l'architettura della rete neurale
3. **Modulo di addestramento**: implementa la logica per addestrare il modello
4. **Modulo di valutazione**: calcola le metriche di performance del modello
5. **Modulo di interfaccia**: permette di testare il modello su nuove immagini

### Flusso di lavoro

1. Caricamento e preparazione del dataset
2. Definizione dell'architettura della rete neurale
3. Addestramento del modello sui dati di training
4. Valutazione del modello sui dati di test
5. Salvataggio del modello addestrato
6. Utilizzo del modello per classificare nuove immagini

## Implementazione

### 1. Preparazione dell'ambiente

Prima di iniziare, installiamo le librerie necessarie:

```python
# Installazione delle librerie necessarie
!pip install torch torchvision numpy matplotlib pillow
```

### 2. Importazione delle librerie

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import os
import time
```

### 3. Preparazione dei dati

Utilizzeremo il dataset CIFAR-10, che contiene 60.000 immagini a colori di dimensione 32x32 pixel, suddivise in 10 classi diverse.

```python
# Definizione delle trasformazioni da applicare alle immagini
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomCrop(32, padding=4),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

# Caricamento del dataset di training
trainset = torchvision.datasets.CIFAR10(root='./data', train=True,
                                       download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=128,
                                         shuffle=True, num_workers=2)

# Caricamento del dataset di test
testset = torchvision.datasets.CIFAR10(root='./data', train=False,
                                      download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=128,
                                        shuffle=False, num_workers=2)

# Definizione delle classi
classes = ('aereo', 'automobile', 'uccello', 'gatto', 'cervo',
          'cane', 'rana', 'cavallo', 'nave', 'camion')
```

### 4. Definizione del modello

Implementiamo una rete neurale convoluzionale (CNN) per il riconoscimento delle immagini:

```python
class ConvNet(nn.Module):
    def __init__(self):
        super(ConvNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.fc2 = nn.Linear(512, 10)
        self.dropout = nn.Dropout(0.25)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = self.pool(self.relu(self.conv3(x)))
        x = x.view(-1, 128 * 4 * 4)
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.fc2(x)
        return x

# Inizializzazione del modello
model = ConvNet()

# Verifica se è disponibile una GPU
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Utilizzo del dispositivo: {device}")
model.to(device)
```

### 5. Addestramento del modello

```python
# Definizione della funzione di perdita e dell'ottimizzatore
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Funzione per l'addestramento del modello
def train_model(model, trainloader, criterion, optimizer, num_epochs=10):
    start_time = time.time()
    train_losses = []
    
    for epoch in range(num_epochs):
        running_loss = 0.0
        for i, data in enumerate(trainloader, 0):
            inputs, labels = data
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
            if i % 100 == 99:
                print(f'Epoca {epoch + 1}, Batch {i + 1}, Loss: {running_loss / 100:.3f}')
                train_losses.append(running_loss / 100)
                running_loss = 0.0
    
    elapsed_time = time.time() - start_time
    print(f'Addestramento completato in {elapsed_time:.2f} secondi')
    return train_losses

# Addestramento del modello
train_losses = train_model(model, trainloader, criterion, optimizer, num_epochs=5)

# Salvataggio del modello addestrato
torch.save(model.state_dict(), 'cifar_model.pth')
print("Modello salvato con successo")
```

### 6. Valutazione del modello

```python
# Funzione per la valutazione del modello
def evaluate_model(model, testloader):
    correct = 0
    total = 0
    class_correct = list(0. for i in range(10))
    class_total = list(0. for i in range(10))
    
    with torch.no_grad():
        for data in testloader:
            images, labels = data
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            # Calcolo dell'accuratezza per classe
            c = (predicted == labels).squeeze()
            for i in range(labels.size(0)):
                label = labels[i]
                class_correct[label] += c[i].item()
                class_total[label] += 1
    
    # Stampa dell'accuratezza complessiva
    print(f'Accuratezza della rete sui 10000 immagini di test: {100 * correct / total:.2f}%')
    
    # Stampa dell'accuratezza per classe
    for i in range(10):
        print(f'Accuratezza per {classes[i]}: {100 * class_correct[i] / class_total[i]:.2f}%')

# Valutazione del modello
evaluate_model(model, testloader)
```

### 7. Visualizzazione dei risultati

```python
# Funzione per visualizzare le immagini
def imshow(img):
    img = img / 2 + 0.5  # Denormalizzazione
    npimg = img.numpy()
    plt.figure(figsize=(10, 4))
    plt.imshow(np.transpose(npimg, (1, 2, 0)))
    plt.axis('off')
    plt.show()

# Visualizzazione di alcune immagini di test con le relative predizioni
def visualize_predictions(model, testloader, classes):
    dataiter = iter(testloader)
    images, labels = next(dataiter)
    images, labels = images.to(device), labels.to(device)
    
    outputs = model(images)
    _, predicted = torch.max(outputs, 1)
    
    # Visualizzazione delle immagini
    images_cpu = images.cpu()
    imshow(torchvision.utils.make_grid(images_cpu[:8]))
    
    # Stampa delle etichette reali e predette
    print('Etichette reali: ', ' '.join(f'{classes[labels[j]]:5s}' for j in range(8)))
    print('Etichette predette: ', ' '.join(f'{classes[predicted[j]]:5s}' for j in range(8)))

# Visualizzazione delle predizioni
visualize_predictions(model, testloader, classes)
```

### 8. Interfaccia per testare il modello su nuove immagini

```python
# Funzione per caricare e preparare un'immagine
def prepare_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((32, 32)),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])
    
    image = Image.open(image_path).convert('RGB')
    image_tensor = transform(image).unsqueeze(0).to(device)
    return image, image_tensor

# Funzione per classificare un'immagine
def classify_image(model, image_tensor, classes):
    with torch.no_grad():
        outputs = model(image_tensor)
        _, predicted = torch.max(outputs, 1)
        probability = torch.nn.functional.softmax(outputs, dim=1)[0] * 100
        
        print(f'Classe predetta: {classes[predicted[0]]}')
        print(f'Probabilità: {probability[predicted[0]]:.2f}%')
        
        # Visualizzazione delle probabilità per tutte le classi
        for i in range(len(classes)):
            print(f'{classes[i]}: {probability[i]:.2f}%')

# Esempio di utilizzo
# image_path = 'path/to/your/image.jpg'
# image, image_tensor = prepare_image(image_path)
# plt.imshow(image)
# plt.axis('off')
# plt.show()
# classify_image(model, image_tensor, classes)
```

## Test e debugging

Durante lo sviluppo del progetto, è importante monitorare diversi aspetti:

1. **Overfitting**: se il modello performa molto bene sui dati di training ma male sui dati di test, potrebbe essere necessario aggiungere tecniche di regolarizzazione come dropout o data augmentation.

2. **Underfitting**: se il modello non riesce a imparare dai dati di training, potrebbe essere necessario aumentare la complessità del modello o addestrarlo per più epoche.

3. **Bilanciamento del dataset**: assicurarsi che il dataset sia bilanciato, ovvero che contenga un numero simile di esempi per ogni classe.

4. **Prestazioni computazionali**: monitorare l'utilizzo della memoria e del tempo di addestramento, specialmente se si lavora con dataset di grandi dimensioni.

## Miglioramenti possibili

Ecco alcune idee per estendere e migliorare il progetto:

1. **Utilizzo di architetture più avanzate**: implementare reti neurali più complesse come ResNet, VGG o EfficientNet.

2. **Transfer learning**: utilizzare modelli pre-addestrati su dataset più grandi e adattarli al nostro problema specifico.

3. **Interfaccia grafica**: sviluppare un'interfaccia grafica con Tkinter o PyQt per rendere più facile l'utilizzo del sistema.

4. **Deployment web**: creare un'applicazione web con Flask o Django che permetta agli utenti di caricare immagini e ottenere predizioni.

5. **Ottimizzazione degli iperparametri**: utilizzare tecniche come grid search o random search per trovare i migliori iperparametri per il modello.

6. **Spiegabilità del modello**: implementare tecniche per visualizzare quali parti dell'immagine influenzano maggiormente la decisione del modello (ad esempio, Grad-CAM).

## Conclusioni

In questo progetto, abbiamo implementato un sistema completo di riconoscimento delle immagini utilizzando PyTorch. Abbiamo coperto tutte le fasi del processo di machine learning, dalla preparazione dei dati all'addestramento del modello, fino alla valutazione e all'utilizzo per classificare nuove immagini.

Questo progetto rappresenta un'ottima base per esplorare ulteriormente il campo della computer vision e del deep learning, e può essere facilmente esteso per affrontare problemi più complessi o specifici.

## Navigazione

- [Torna all'elenco dei progetti](../README.md)
- [Progetto precedente: Bot di Telegram](04-bot-telegram.md)