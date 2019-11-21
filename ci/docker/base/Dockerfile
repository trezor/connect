FROM debian:10

# deps
RUN apt-get install scons libsdl2-dev libsdl2-image-dev

# create folder for libs
RUN mkdir ~/libs
RUN cd ~/libs

# download and build BRIDGE
RUN go get github.com/trezor/trezord-go
RUN go build github.com/trezor/trezord-go

# download and build EMULATOR
RUN https://github.com/trezor/trezor-firmware.git
RUN cd ~/trezor-firmware/core
RUN pipenv run make build_unix