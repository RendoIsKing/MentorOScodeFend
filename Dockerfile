# 1. Use a base image that has Node.js
FROM node:18-alpine as build

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json (if exists) to the working directory
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application code to the working directory
COPY . .

# 6. Build the Vite project
RUN npm run build

# 7. Use a lightweight web server to serve the static files (e.g., serve)
FROM node:18-alpine as production

# 8. Install a lightweight static server like `serve`
RUN npm install -g serve

# 9. Set the working directory
WORKDIR /app

# 10. Copy the built files from the previous stage
COPY --from=build /app/build /app

# 11. Expose the port Vite will be served on (default is 3000, but you can change it)
EXPOSE 3001

# 12. Command to serve the static files (replace '3000' with your desired port)
CMD ["serve", "-s", ".", "-l", "3001"]

