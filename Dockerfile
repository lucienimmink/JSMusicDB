FROM nginx:1.21.1-alpine

COPY ./dist /etc/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
