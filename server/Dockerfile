# --- Stage 1: Development ---
FROM node:22.19-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generate Prisma Client ก่อนรัน Server
# RUN npx prisma generate 
EXPOSE 3000
# ใช้ nodemon เพื่อทำ auto-restart เวลาแก้โค้ด ในโหมด development
CMD ["sh", "-c", "npm run db:dev && npm run dev"]

# --- Stage 2: Production ---
FROM node:22.19-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
# ใน production เราไม่ใช้ nodemon เพราะไม่ต้องการ auto-restart และต้องการให้แอปทำงานแบบปกติ
CMD ["sh", "-c", "npm run db:prod && npm run prod"]