FROM node:16-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN ["yarn", "install"]
RUN ["yarn", "run", "ng", "build", "-c", "producation", "--verbose"]

FROM nginx:1.19.7-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]