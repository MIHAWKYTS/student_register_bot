# Use uma imagem oficial do Node.js como base
FROM node:lts

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie o arquivo package.json e package-lock.json (se existir)
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante do código da aplicação para dentro do contêiner
COPY . .
COPY ./prisma prisma


# Exponha a porta (caso o bot use uma porta para o Express ou outra API)
# EXPOSE 3000

# Defina as variáveis de ambiente (recomendado usar .env)
ENV NODE_ENV=production

# Comando para rodar o bot
CMD ["node", "bot.js"]
