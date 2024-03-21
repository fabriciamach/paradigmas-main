# Use a imagem Nginx como base
FROM nginx:alpine

# Copie os arquivos HTML e JavaScript para o diretório de trabalho do Nginx
COPY . /usr/share/nginx/html


# use > docker build -t meu-projeto .
# depois > docker run -p 8080:80 meu-projeto
