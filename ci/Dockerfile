# buster means deb:10 which equals trezor-firmware docker
FROM node:8.16-buster

# trezor emu
ENV SDL_VIDEODRIVER "dummy"
ENV XDG_RUNTIME_DIR "/var/tmp"

# trezorctl https://click.palletsprojects.com/en/7.x/python3/
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

RUN apt-get update && apt-get install -y \ 
    scons \
    libsdl2-dev \
    libsdl2-image-dev \
    python3-dev \
    python3-pip
    
RUN pip3 install --upgrade setuptools
RUN pip3 install trezor
RUN pip3 install termcolor

RUN python3 --version
RUN python3 -m pip --version
RUN trezorctl version
RUN node -v
RUN npm -v
RUN yarn -v