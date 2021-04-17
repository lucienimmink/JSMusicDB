FROM nginx:1.19.10-alpine

COPY ./dist /etc/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
