
function cleanup {
  # print out all docker logs on cleanup
  # docker logs $id
  # stop trezor-env container
  docker stop $id
  ps aux | grep python3
  ps aux | grep trezord
}

trap cleanup EXIT

echo "to run in ci use './run.sh ci'"

if [ "$1" = "ci" ]
then
 docker run --rm -d \
  --name connect-tests \
  -e SDL_VIDEODRIVER="dummy" \
  --network="host" \
  mroz22/trezor-env \
  bash -c "rm -rf /var/tmp/trezor.flash && python3 ./main.py"
else
  xhost +
  docker run --rm -d \
    --name connect-tests \
    --ipc host \
    -e DISPLAY=$DISPLAY \
    -e QT_X11_NO_MITSHM=1 \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
    --network="host" \
    mroz22/trezor-env \
    bash -c "rm -rf /var/tmp/trezor.flash && python3 ./main.py"
fi

id=$(docker ps -aqf "name=connect-tests")

yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --runInBand