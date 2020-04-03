
function cleanup {
  echo "cleanup"

  # print out all docker logs on cleanup
  # docker logs $id

  # stop trezor-env container
  id=$(docker ps -aqf "name=connect-tests")
  echo $id
  [ $id ] && docker stop $id
  echo "ran ${i} times"
}

trap cleanup EXIT

echo "to run in ci use './run.sh ci'"

i=0
retry="${1-1}"
echo "retry times if failed: ${retry}"
RET=1

until [ $i -eq $retry ]; do
  echo "run number: ${i}"
  [ $i -gt 0 ] && echo "status code from previous run: ${RET}"

  if [ "$2" = "ci" ]
  then
    docker run --rm -d \
      --name connect-tests \
      -e SDL_VIDEODRIVER="dummy" \
      --network="host" \
      mroz22/trezor-user-env \
      bash -c "rm -rf /var/tmp/trezor.flash && python3 ./main.py"
    
    yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --runInBand --bail
  else
    xhost +
    docker run --rm -d \
      --name connect-tests \
      --ipc host \
      -e DISPLAY=$DISPLAY \
      -e QT_X11_NO_MITSHM=1 \
      -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
      --network="host" \
      mroz22/trezor-user-env \
      bash -c "rm -rf /var/tmp/trezor.flash && python3 ./main.py"
      # todo: all this bash -c part should be moved to COMMAND or ENTRYPOINT command in docker
      yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --runInBand --bail
  fi
  RET=$?
  ((i+=1))
  [ $RET -eq 0 ] && exit 0
  cleanup
done

exit 1