# Wyb�r obrazu bazowego (Node.js)
FROM node:16-alpine

# Ustawienie katalogu roboczego
WORKDIR /app

# Skopiowanie plik�w package.json i package-lock.json
COPY package*.json ./

# Instalowanie zale�no�ci
RUN npm install

# Skopiowanie reszty aplikacji
COPY . .

# Uruchomienie aplikacji w trybie deweloperskim
CMD ["npm", "start"]
