#!/bin/sh
trap 'cleanup' INT

#################
# Functions
cleanup() {
    # Ignore INT and TERM while shutting down
    trap '' INT TERM
    echo "Shutting down..."

    # Kill all processes in this group
    kill -TERM 0
    wait
    echo "...done."
}

start_emulator() {
    echo "Starting emulator..."
    # Start emulator
    cd $emulator_path
    PYOPT=0 ./emu.sh > /dev/null 2>&1 &
    pid_emul=$!
    #PYOPT=0 ./emu.sh 2>&1 > /dev/null &
    echo "Emulator ready.\n"
}

start_transport() {
    echo "Starting trezord..."
    # Start trezord (i.e. bridge) before each new set of tests
    cd $trezord_path
    ./trezord-go -e 21324 > /dev/null 2>&1 &
    pid_transport=$!
    #./trezord-go -e 21324 2>&1 > /dev/null &
    echo "Bridge ready.\n"
}

init_device() {
    mnemonic="$1"
    pin="$2"
    passphraseEnabled="$3" # True/False

    echo "Load device with mnemonic: '$mnemonic', pin: '$pin', passphrase: '$passphraseEnabled'..."
    cd $base_path
    python3 ./src/__tests__/init_device.py -m "$mnemonic" -p "$pin" -s "$passphraseEnabled" 2>&1 > /dev/null
    echo "Device ready.\n"
}

setup_mnemonic_allallall() {
    init_device "$mnemonic_all" "$pin_0" "False"
}

setup_mnemonic_nopin_nopassphrase() {
    init_device "$mnemonic_12" "$pin_0" "False"
}

setup_mnemonic_nopin_passphrase() {
    init_device "$mnemonic_12" "$pin_0" "True"
}

setup_mnemonic_pin_nopassphrase() {
    init_device "$mnemonic_12" "$pin_4" "False"
}

setup_mnemonic_pin_passphrase() {
    init_device "$mnemonic_12" "$pin_4" "True"
}

run_test() {
    echo "Running tests..."
    cd $base_path

    # todo: npx
    npx babel-node ./node_modules/karma/bin/karma start --test="$1"
}
# Functions: END
#################

# todo: add usage of this script

# todo: put this config vars in its own file?
mnemonic_12="alcohol woman abuse must during monitor noble actual mixed trade anger aisle"
mnemonic_18="owner little vague addict embark decide pink prosper true fork panda embody mixture exchange choose canoe electric jewel"
mnemonic_24="dignity pass list indicate nasty swamp pool script soccer toe leaf photo multiply desk host tomato cradle drill spread actor shine dismiss champion exotic"
mnemonic_all="all all all all all all all all all all all all"

pin_0=""
pin_4="1234"
pin_6="789456"
pin_8="45678978"

# Assuming this script is called from the root of "trezor-connect"
base_path=`pwd`

# todo paths - arguments?
trezord_path="../trezord-go"
emulator_path="../trezor-core"

# Generate all possible tests that can run
# Valid test name is any file with name ./src/__tests__/core/*.spec.js
available_tests=$(ls ./src/__tests__/core/*.spec.js | xargs -n 1 basename | cut -d '.' -f1)

# If no argument specified run all tests
# otherwise run only specified tests

# The emulator device is configured for each specific test automatically
OPTIND=1
while getopts "t:e:b:" opt; do
    case $opt in
        t) # Name of test to run
            # Check if passed test name is in $available_tests
            for test_name in $OPTARG; do
                test_name_checked=$(echo "$available_tests" | grep -ow "$test_name")
                if [[ -n "$test_name_checked" ]]; then
                    if [[ -z "$tests_to_run" ]]; then
                        tests_to_run="$test_name"
                    else
                        tests_to_run="$tests_to_run $test_name"
                    fi;
                else
                    echo "Invalid test name: '$test_name'"
                    exit
                fi;
            done;
        ;;

        e) # Path to emulator
            emulator_path="$OPTARG"
        ;;

        b) # Path to transport
            trezord_path="$OPTARG"
        ;;

        \?)
            echo "Invalid option: -$OPTARG"
            cleanup
            exit
        ;;
    esac
done
shift $((OPTIND-1))

echo "Specified tests to run: $tests_to_run"

if [[ -z "$tests_to_run" ]]; then
    # No tests specified - run all tests
    echo "Will run all available tests"

    # TODO
else
    # Run only specific tests
    for t in $tests_to_run; do
        echo "========"
        echo "========"
        echo "Will run tests for '$t\n'"

        start_emulator

        if [ "$t" == "getPublicKey" ]; then
            setup_mnemonic_nopin_nopassphrase
        elif [ "$t" == "ethereumGetAddress"  ]; then
            setup_mnemonic_nopin_nopassphrase
        fi

        start_transport
        run_test $t


        # todo: send different signal?
        kill -TERM $pid_emul
        kill -TERM $pid_transport

        echo "========"
        echo "========\n"
    done
fi;

cleanup
exit
