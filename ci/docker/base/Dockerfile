FROM debian:10

# curl
RUN apt-get install -y curl

# node 8
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

# yarn
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# deps
RUN apt-get update
RUN apt-get install -y build-essential scons libsdl2-dev libsdl2-image-dev golang git nodejs yarn pipenv

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