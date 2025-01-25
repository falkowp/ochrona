FROM python:3.10-slim

WORKDIR /app

# Instalacja zale¿noœci
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Kopiowanie kodu aplikacji
COPY . . 

# Uruchomienie aplikacji w trybie deweloperskim
CMD ["flask", "run", "--host=0.0.0.0"]
