FROM node:18-alpine
WORKDIR /app
COPY functions/package*.json ./functions/
RUN cd functions && npm install
COPY functions/ ./functions/
RUN cd functions && npm run build
EXPOSE 8080
CMD ["node", "functions/lib/server.js"]
