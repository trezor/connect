xhost +

function cleanup {
  # print out all docker logs on cleanup
  # docker logs $id
  # stop trezor-env container
  docker stop $id
  ps aux | grep python3
  ps aux | grep trezord
}

trap cleanup EXIT

# to disable video device GUI:
# -e SDL_VIDEODRIVER="dummy" \

docker run --rm -d \
    --name connect-tests \
    --ipc host \
    -e DISPLAY=$DISPLAY \
    -e QT_X11_NO_MITSHM=1 \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
    --network="host" \
    mroz22/trezor-env \
    bash -c "rm -rf /var/tmp/trezor.flash && python3 ./main.py"
    # mroz22/trezor-env:latest \

id=$(docker ps -aqf "name=connect-tests")

yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --runInBand
