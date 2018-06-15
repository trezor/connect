#!/bin/sh
trap 'cleanup' INT

# todo: put this config vars in its own file?
mnemonic_12="alcohol woman abuse must during monitor noble actual mixed trade anger aisle"
mnemonic_18="owner little vague addict embark decide pink prosper true fork panda embody mixture exchange choose canoe electric jewel"
mnemonic_24="dignity pass list indicate nasty swamp pool script soccer toe leaf photo multiply desk host tomato cradle drill spread actor shine dismiss champion exotic"
mnemonic_all="all all all all all all all all all all all all"

pin_0=""
pin_4="1234"
pin_6="789456"
pin_8="45678978"

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

    exit
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
    #./trezord-go -e 21324 > /dev/null 2>&1 &
    ./trezord-go -e 21324 -e 21325 > /dev/null 2>&1 &
    #./trezord-go -e 21324 -e 21325 2>&1 > /dev/null &
    pid_transport=$!
    echo "Bridge ready.\n"
}

init_device() {
    mnemonic="$1"
    pin="$2"
    passphraseEnabled="$3" # True/False

    echo "Load device with mnemonic: '$mnemonic', pin: '$pin', passphrase: '$passphraseEnabled'..."
    cd $base_path
    if [ "$passphraseEnabled" == "True" ]; then
        python3 ./src/__tests__/init_device.py -m "$mnemonic" -p "$pin" --passphrase 2>&1 > /dev/null
    else
        python3 ./src/__tests__/init_device.py -m "$mnemonic" -p "$pin" --no-passphrase 2>&1 > /dev/null
    fi;
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
# Functions: END
#################


#################
# Test Functions

# This will run the karma tests
run_karma() {
    echo "Running tests..."
    cd $base_path
    # todo: npx
    npx babel-node ./node_modules/karma/bin/karma start --test="$1" --subtest="$2"
}

run_test() {
    echo "========"
    echo "========"
    echo "Will run tests for '$1'\n"

    # Since test functions are named like this: test_nameOfTest
    # the following line will call desired test function
    test_$1

    # todo: send different signal?
    # something like:
    # while ps $pid_emul returns something
    # sleep 0.1s
    kill -TERM $pid_emul
    kill -TERM $pid_transport

    echo "========"
    echo "========\n"
}

test_getPublicKey() {
    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
    run_karma "getPublicKey"
}

test_ethereumGetAddress() {
    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
    run_karma "ethereumGetAddress"
}

test_ethereumSignMessage() {
    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
    run_karma "ethereumSignMessage"
}

test_ethereumSignTx() {
    # TODO

    # EthereumSignTx has multiple tests with a different device setup
    # - subtest specifies what type of test should be called
    #subtests="knownErc20Token unknownErc20Token signTxNoData signTxData signTxMessage signTxNewContract sanityChecks signTxNoDataEip155 signTxDataEip155"
    subtests="knownErc20Token"

    for subtest in $subtests; do
        start_emulator

        if [ $subtest == "signTxNoDataEip155" ] || [ $subtest == "signTxDataEip155" ]; then
            setup_mnemonic_allallall
        else
            setup_mnemonic_nopin_nopassphrase
        fi;

        start_transport
        run_karma "ethereumSignTx" $subtest
    done;
}

test_ethereumVerifyMessage() {
    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport

    run_karma "ethereumVerifyMessage"
}

test_nemGetAddress() {
    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport

    run_karma "nemGetAddress"
}
# Test Functions: END
#################


# todo: add usage of this script

# Assuming this script is called from the root of "trezor-connect"
base_path=`pwd`

trezord_path="../trezord-go"
emulator_path="../trezor-core"

# Generate all possible tests that can run
# Valid test name is any file with name ./src/__tests__/core/*.spec.js
available_tests=$(ls ./src/__tests__/core/*.spec.js | xargs -n 1 basename | cut -d "." -f1 | tr "\n" " ")
# Delete the trailing whitespace (one character)
available_tests=$(echo $available_tests | rev | cut -c 1- | rev)

# If no argument specified (i.e. "yarn test") run all tests
# otherwise run only specified tests

# The emulator device is configured for each specific test automatically
OPTIND=1
while getopts "t:x:le:b:" opt; do
    case $opt in
        t) # Name of test to run
            # Check if passed test name is in $available_tests
            for test_name in $OPTARG; do
                test_name_checked=$(echo "$available_tests" | grep -ow "$test_name")
                if [ -n "$test_name_checked" ]
                then
                    if [ -z "$tests_to_run" ]
                    then
                        tests_to_run="$test_name"
                    else
                        tests_to_run="$tests_to_run $test_name"
                    fi
                else
                    echo "Invalid test name: '$test_name'"
                    echo "  - Choose from following tests: '$available_tests'"
                    cleanup
                fi
            done;
        ;;

        x) # Exclude tests that shouldn't run (i.e. run all but specified tests)
            for test_name in $OPTARG; do
                if [ -z "$tests_not_to_run" ]
                then
                    tests_not_to_run="$test_name"
                else
                    tests_not_to_run="$tests_to_run $test_name"
                fi
            done
        ;;

        l) # List available tests
            echo "Choose from following tests: '$available_tests'"
            exit
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
        ;;
    esac
done
shift $((OPTIND-1))

echo "Specified tests to run: "$tests_to_run""

if [ -z "$tests_to_run" ]
then
    echo "========"
    echo "========"
    # Will run either all tests or all but specified tests
    if [ -z "$tests_not_to_run" ]
    then
        echo "Running all test\n"
        for t in $available_tests; do
            run_test $t
        done
    else
        echo "Running all tests excluding: ${tests_not_to_run}\n"
        for t in $available_tests; do
            is_excluded=""
            is_excluded=$(echo "$tests_not_to_run" | grep -ow "$t")
            if [ -z "$is_excluded" ]
            then
                run_test $t
            fi
        done
    fi
else
    # Run only specific tests
    for t in $tests_to_run; do
        run_test $t
    done
fi;

cleanup
