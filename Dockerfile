FROM node:16-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN yarn install
RUN yarn run ng build -- --prod
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/AccessPointMap /usr/share/nginx/html
EXPOSE 80