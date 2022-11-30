FROM gitlabdev.centralpattana.co.th/baseimages/nodejs:lts-alpine

ENV NODE_ENV=production

ENV VUE_APP_APP_VERSION=1.9.1

ENV VUE_APP_AGREEMENT_URL=https://www.centralpattana.co.th/th/sustainability/corporate-governance/privacy-policy

# make the 'app' folder the current working directory
RUN mkdir -p /app

WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
# RUN npm install @types/file-saver
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run build-prod

FROM gitlabdev.centralpattana.co.th/baseimages/nginx:1.19.2-alpine

COPY --from=0 /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

#COPY nginx/nginx.uat.conf /etc/nginx/conf.d

EXPOSE 8100

CMD ["nginx", "-g", "daemon off;"]
