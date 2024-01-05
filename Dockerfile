FROM node:20-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN ["yarn", "install"]
RUN ["yarn", "run", "ng", "build", "-c", "production", "--verbose"]

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
