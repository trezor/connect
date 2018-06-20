#!/bin/sh
trap 'cleanup' INT

################# Script vars
# Assuming this script is in the root of "trezor-connect"
base_path=`pwd`
trezord_path="${base_path}/../trezord-go"
emulator_path="${base_path}/../trezor-core"
logs_path="${base_path}/karma-logs.txt"

run_type="" # "all", "specified", "excluded"
# Generate all possible tests that can run
# Valid test name is any file with name ./src/__tests__/core/*.spec.js
available_tests=$(ls ./src/__tests__/core/*.spec.js | xargs -n 1 basename | cut -d "." -f1 | tr "\n" " ")
# Delete the trailing whitespace (one character)
available_tests=$(echo $available_tests | rev | cut -c 1- | rev)
tests_to_run=""

should_print_debug=0
karma_log_level="error" # "disable", "error", "warn", "info", "debug"

finished_test_names=""
finished_test_results=""

test_results=""

red=$(tput setaf 1)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
bold=$(tput bold)
reset=$(tput sgr0)
################# Script vars: END

################# Device config vars
mnemonic_12="alcohol woman abuse must during monitor noble actual mixed trade anger aisle"
mnemonic_18="owner little vague addict embark decide pink prosper true fork panda embody mixture exchange choose canoe electric jewel"
mnemonic_24="dignity pass list indicate nasty swamp pool script soccer toe leaf photo multiply desk host tomato cradle drill spread actor shine dismiss champion exotic"
mnemonic_all="all all all all all all all all all all all all"

pin_0=""
pin_4="1234"
pin_6="789456"
pin_8="45678978"
################# Device config vars: END

################# Functions
cleanup() {
    cd $base_path
    #rm -rf './karma-logs.txt'
    rm -f $logs_path

    # Ignore INT and TERM while shutting down
    trap '' INT TERM

    # Kill all processes in this group
    kill -TERM 0
    wait > /dev/null 2>&1

    exit
}

log_error() {
    description=$1
    error_message=$2

    echo "❗️ ${red}${bold}Error - $description:$reset $error_message"
}

show_usage() {
    echo "Usage: run [OPTIONS] [ARGS]"
    echo ""
    echo "Options:"

    echo "  -a                  Run all available tests"
    echo "  -t <test_name>      Run <test_names>"
    echo "  -x <test_name>      Run all tests but <test_name>"
    echo "  -l                  Show available tests and exit"
    echo "  -e                  Specify path to emulator"
    echo "  -b                  Specify path to transport"
    echo "  -p                  Show default paths to emulator and transport and exit"
    echo "  -d                  Print debug messages while running tests"
    echo "  -k <logl_level>     todo: Set Karma's log-level ('disable', 'error' - default, 'warn', 'info', 'debug')"
    echo "  -h                  Show this message and exit"
}

start_emulator() {
    if [ $should_print_debug -eq 1 ]; then
        echo "Starting emulator..."
    fi;

    # Start emulator
    cd $emulator_path
    PYOPT=0 ./emu.sh > /dev/null 2>&1 &
    pid_emul=$!
    #PYOPT=0 ./emu.sh 2>&1 > /dev/null &

    if [ $should_print_debug -eq 1 ]; then
        echo "Emulator ready.\n"
    fi;
}

start_transport() {
    if [ $should_print_debug -eq 1 ]; then
        echo "Starting trezord..."
    fi;

    cd $trezord_path
    #./trezord-go -e 21324 > /dev/null 2>&1 &
    ./trezord-go -e 21324 -e 21325 > /dev/null 2>&1 &
    #./trezord-go -e 21324 -e 21325 2>&1 > /dev/null &
    pid_transport=$!

    if [ $should_print_debug -eq 1 ]; then
        echo "Bridge ready.\n"
    fi;
}

init_device() {
    mnemonic="$1"
    pin="$2"
    passphraseEnabled="$3" # True/False

    if [ $should_print_debug -eq 1 ]; then
        echo "Load device with mnemonic: '$mnemonic', pin: '$pin', passphrase: '$passphraseEnabled'..."
    fi;

    cd $base_path
    if [ "$passphraseEnabled" == "True" ]; then
        python3 ./src/__tests__/init_device.py -m "$mnemonic" -p "$pin" --passphrase 2>&1 > /dev/null
    else
        python3 ./src/__tests__/init_device.py -m "$mnemonic" -p "$pin" --no-passphrase 2>&1 > /dev/null
    fi;

    if [ $should_print_debug -eq 1 ]; then
        echo "Device ready.\n"
    fi;
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

show_available_tests() {
    echo "Following tests are available:"
    for test in $available_tests; do
        echo "  $green-$reset $test"
    done;
}

show_default_paths() {
    echo "Default paths:"
    echo "  emulator:   '${emulator_path}'"
    echo "  transport:  '${trezord_path}'"
}

show_results() {
    echo "\n\n\n"

    pad=$(printf '%0.1s' "."{1..200})
    padlength=100

    reset_ifs=$IFS
    IFS=";"
    for r in $test_results; do
        test_name=$(echo $r | cut -d"@" -f1)
        test_result=$(echo $r | cut -d"@" -f2)

        printf '%s' "- $test_name"
        printf '%*.*s' 0 $((padlength - ${#test_name} )) "$pad"
        printf '%s\n' "$test_result"
    done;
    IFS=$reset_ifs

    echo "\n"
}

validate_test_names() {
    test_names=$1

    # Checks whether 'test_names' are actually name of available tests
    for test_name in $test_names; do
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
            log_error "invalid test name" "'$test_name'"
            echo "  Use $yellow-l$reset option too see all available tests"
            cleanup
        fi
    done;
}

run_karma() {
    cd $base_path

    path_babel_node="./node_modules/babel-cli/bin/babel-node.js"
    path_karma="./node_modules/karma/bin/karma"

    # Leave the regular output and also redirect to log file
    $path_babel_node $path_karma start --test="$1" --subtest="$2" | tee /dev/tty > $logs_path


    # If test has a subtest
    if [ -z "$2" ]; then
        finished_test_names="${finished_test_names}$1;"
    else
        finished_test_names="${finished_test_names}$1/$2;"
    fi;

    # Grab last summary line after test has finished
    # so we can show summary for all tests later
    result=$(cat $logs_path | grep -E "SUCCESS|FAILED" | cut -d ":" -f2 | tail -1 | rev | cut -d " " -f6- | rev)

    finished_test_results="${finished_test_results}${result};"

    delimiter1="@"
    delimiter2=";"
    test_name=$1
    if [ -n "$2" ]; then
        test_name="${green}${bold}$1/${reset}${green}$2${reset}"
    fi;
    test_results="${test_results}${test_name}${delimiter1}${result}${delimiter2}"
}

run_all_tests() {
    echo "${green}${bold}Running all tests...${reset}"
    for t in $available_tests; do
        run_test $t
    done
}

run_specified_tests() {
    for t in $1; do
        run_test $t
    done;
}

run_excluded_tests() {
    echo "${yellow}${bold}Excluded tests: ${tests_not_to_run}${reset}"
    echo "${green}${bold}Running all other tests...${reset}"

    # No need to validate whether names of tests in $tests_not_to_run
    # are valid. Just ignore invalid test name.

    for t in $available_tests; do
        is_excluded=""
        is_excluded=$(echo "$tests_not_to_run" | grep -ow "$t")
        if [ -z "$is_excluded" ]
        then
            run_test $t
        fi
    done
}

run_test() {
    echo "${green}${bold} - Current test: $1${reset}"

    # Since test functions are named like this: test_nameOfTest
    # the following line will call desired test function
    test_$1

    kill -TERM $pid_emul
    wait $pid_emul > /dev/null 2>&1

    kill -TERM $pid_transport
    wait $pid_transport > /dev/null 2>&1
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
    # EthereumSignTx has multiple tests with a different device setup
    # - subtest specifies what type of test should be called
    subtests="knownErc20Token unknownErc20Token noData data message newContract sanityChecks noDataEip155 dataEip155"

    for subtest in $subtests; do
        echo "${green}   - subtest: ${subtest}${reset}"
        start_emulator

        if [ $subtest == "noDataEip155" ] || [ $subtest == "dataEip155" ]; then
            setup_mnemonic_allallall
        else
            setup_mnemonic_nopin_nopassphrase
        fi;

        start_transport
        run_karma "ethereumSignTx" $subtest

        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1

        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
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

test_nemSignTransactionMosaic() {
    # todo: emulator firmware

    subtests="supplyChange creation creationProperties creationLevy"

    for subtest in $subtests; do
        echo "${green}   - subtest: ${subtest}${reset}"

        start_emulator
        setup_mnemonic_nopin_nopassphrase
        start_transport

        run_karma "nemSignTransactionMosaic" $subtest

        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1

        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
    done;

    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
}

test_nemSignTransactionMultisig() {
    # todo: emulator firmware

    subtests="aggregateModification multisig multisigSigner"

    for subtest in $subtests; do
        echo "${green}   - subtest: ${subtest}${reset}"

        start_emulator
        setup_mnemonic_nopin_nopassphrase
        start_transport

        run_karma "nemSignTransactionMultisig" $subtest

        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1

        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
    done;

    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
}

test_nemSignTransactionOthers() {
    # todo: emulator firmware

    subtests="importanceTransfer provisionNamespace"

    for subtest in $subtests; do
        echo "${green}   - subtest: ${subtest}${reset}"

        start_emulator
        setup_mnemonic_nopin_nopassphrase
        start_transport

        run_karma "nemSignTransactionOthers" $subtest

        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1

        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
    done;

    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
}

test_nemSignTransactionTransfers() {
    subtests="simple encryptedPayload xemAsMosaic unknownMosaic knownMosaic knownMosaicWithLevy multipleMosaics"

    for subtest in $subtests; do
        echo "${green}   - subtest: ${subtest}${reset}"

        start_emulator
        setup_mnemonic_nopin_nopassphrase
        start_transport

        run_karma "nemSignTransactionTransfers" $subtest

        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1

        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
    done;

    start_emulator
    setup_mnemonic_nopin_nopassphrase
    start_transport
}
################# Functions: END

# Show help if no option provided
if [ $# -eq 0 ]; then
    show_usage
    cleanup
fi;

# The emulator device is configured for each specific test automatically
OPTIND=1
while getopts ":at:x:le:b:k:pdh" opt; do
    case $opt in
        a) # Run all tests
            run_type="all"
        ;;
        t) # Run specified tests
            validate_test_names "$OPTARG"
            run_type="specified"
        ;;
        x) # Exclude tests that shouldn't run (i.e. run all but specified tests)
            run_type="excluded"
            tests_not_to_run="$OPTARG"
        ;;
        l) # Show available tests
            show_available_tests
            cleanup
        ;;
        e) # Path to emulator
            emulator_path="$OPTARG"
        ;;
        b) # Path to transport
            trezord_path="$OPTARG"
        ;;
        h) # Script usage
            show_usage
            cleanup
        ;;
        p) # Show default paths to emaulator and transport
            show_default_paths
            cleanup
        ;;
        d) # Print debug messages (emulator, transport)
            should_print_debug=1
        ;;
        k) # Karma log level
            karma_log_level="$OPTARG"
        ;;
        \?)
            log_error "invalid option" $OPTARG
            cleanup
        ;;
    esac
done
shift $((OPTIND-1))

if [ "$run_type" = "all" ]; then
    run_all_tests
elif [ "$run_type" = "specified" ]; then
    run_specified_tests "$tests_to_run"
elif [ "$run_type" = "excluded" ]; then
    run_excluded_tests
fi;

show_results
cleanup
