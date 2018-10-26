FROM node:9.3

WORKDIR /trezor-connect-app

# COPY package.json /trezor-connect-app
# COPY yarn.lock /trezor-connect-app

# add inner script and set as executable
ADD scripts/docker-inside.sh /trezor-connect-app/docker-inside.sh
RUN chmod +x /trezor-connect-app/docker-inside.sh
# copy sources
COPY . /trezor-connect-app

# run inner script
ENTRYPOINT ["/bin/bash", "-c", "/trezor-connect-app/docker-inside.sh ${*}", "--"]

# RUN yarn install



# RUN yarn run build
# RUN	yarn run build:inline
# RUN	cp build/js/trezor-connect.*.js build/trezor-connect.min.js
# RUN	cp robots.txt build/robots.txt

# expose ports for copying files to local file system
EXPOSE 8080
CMD [ "yarn", "run", "prod-server" ]
