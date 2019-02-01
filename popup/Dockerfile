FROM node:9.3

WORKDIR /trezor-connect-v4

# add inner script and set as executable
ADD docker/inside.sh /trezor-connect-v4/inside.sh
RUN chmod +x /trezor-connect-v4/inside.sh
# copy sources
COPY . /trezor-connect-v4

# run inner script
ENTRYPOINT ["/bin/bash", "-c", "/trezor-connect-v4/inside.sh", "--"]

# expose ports for copying files to local file system
EXPOSE 8080
CMD [ "yarn", "run", "prod-server" ]