FROM node:8.10

WORKDIR /trezor-connect-app

# add inner script and set as executable
ADD scripts/docker-inside.sh /trezor-connect-app/docker-inside.sh
RUN chmod +x /trezor-connect-app/docker-inside.sh
# copy sources
COPY . /trezor-connect-app

# run inner script
ENTRYPOINT ["/bin/bash", "-c", "/trezor-connect-app/docker-inside.sh ${*}", "--"]

# expose ports for copying files to local file system
EXPOSE 8080
CMD [ "yarn", "run", "prod-server" ]
