FROM debian:10

# curl
RUN apt-get update
RUN apt-get install -y curl

# node 8
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

# deps
RUN apt-get update
RUN apt-get install -y build-essential scons libsdl2-dev libsdl2-image-dev golang git nodejs pipenv

# create main folder
RUN mkdir ~/libs
RUN cd ~/libs

# bridge
RUN go get github.com/trezor/trezord-go
RUN go build github.com/trezor/trezord-go

# emulator
RUN git clone https://github.com/trezor/trezor-firmware.git
RUN cd ./trezor-firmware/core
RUN pipenv run make build_unix