FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000
# Use next start to serve the built app
CMD ["npm", "run", "start"]