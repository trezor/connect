xhost +

function cleanup {
  docker logs $id
  docker stop $id
}

trap cleanup EXIT

docker run --rm -d \
    --name connect-tests \
    --ipc host \
    -e DISPLAY=$DISPLAY \
    -e QT_X11_NO_MITSHM=1 \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
    --network="host" \
    mroz22/trezor-env:latest \
    python3 ./main.py


id=$(docker ps -aqf "name=connect-tests")

# python3 ../trezor-suite/docker/trezor-env/controller/main.py &

# /bin/bash rm -rf /var/tmp/trezor.flash && python3 ./main.py

# while ! nc -z localhost 9001; do
#   echo "Waiting for trezor-env python server on :9001..."
#   sleep 1
# done

yarn jest --config jest.config.js --verbose --detectOpenHandles --forceExit
