FROM node:15

RUN mkdir /bot

WORKDIR /bot 

COPY package.* .

RUN yarn install

COPY . .

EXPOSE 8888

CMD ["yarn", "start"]