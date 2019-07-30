#!/bin/bash
trap 'cleanup' INT

################# Script vars
# Assuming this script is in the root of "trezor-connect"
base_path=`pwd`
trezord_path="${base_path}/../trezord-go"
emulator_path="${base_path}/../trezor-firmware/core"

should_start_emulator="true"

run_type="" # "all", "specified", "excluded"
# Generate all possible tests that can run
# Valid test name is any file with name ./src/__tests__/core/*.spec.js
available_tests=$(ls ./src/__tests__/core/*.spec.js | xargs -n 1 basename | cut -d "." -f1 | tr "\n" " ")
# Delete the trailing whitespace (one character)
available_tests=$(echo $available_tests | rev | cut -c 1- | rev)
tests_to_run=""
tests_not_to_run=""
subtests_not_to_run=""

should_print_karma_debug="false"
should_print_emulator_debug="false"

red=$(tput setaf 1)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
bold=$(tput bold)
reset=$(tput sgr0)
################# Script vars: END

################# Device config vars
mnemonic_all="all all all all all all all all all all all all"
mnemonic_12="alcohol woman abuse must during monitor noble actual mixed trade anger aisle"
mnemonic_abandon="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
pin_0=""
################# Device config vars: END

################# Possible subtests
getAddress_subtests="btc ltc tbtc bch"
#getAddressSegwit_subtests="showSegwit showMultisig3"
getAddressSegwit_subtests="showSegwit"

signMessage_subtests="sign signTestnet signBch signLong"
signMessageSegwit_subtests="sign signLong"

signTransaction_subtests="oneOneFee oneTwoFee oneThreeFee twoTwo testnetOneTwoFee testnetFeeTooHigh lotsOfOutputs feeTooHigh notEnoughFunds spendCoinbase twoChanges p2sh changeOnMainChainAllowed"
signTransactionSegwit_subtests="sendP2sh sendP2shChange sendMultisig1"
signTransactionBgold_subtests="change noChange p2sh p2shWitnessChange sendMultisig1"
signTransactionBcash_subtests="change noChange oldAddr"
signTransactionCapricoin_subtests="signCPC oneTwoFee twoTwoFee notEnoughFunds feeTooHigh"
signTransactionZcash_subtests="signTwoInputsTxVersion1 signInputVersion2 signTwoInputsWithChangeVersion3 signOneInputVersion4"
signTransactionDash_subtests="normalTx specialInput"
signTransactionMultisig_subtests="twoOfThree fifteenOfFifteen missingPubkey"
signTransactionMultisigChange_subtests="externalExternal externalInternal internalExternal multisigExternalExternal"
signTransactionMultisigBech32_subtests="sendBech32 sendP2sh sendAddress"
signTransactionMultisigDoge_subtests="regular bigInput"

verifyMessage_subtests="verify verifyLong verifyTestnet verifyBcash verifyBitcoind"
verifyMessageSegwit_subtests="verify verifyLong verifyTestnet"
verifyMessageSegwitNative_subtests="verify verifyLong verifyTestnet"

ethereumSignTransaction_subtests="knownErc20Token unknownErc20Token noData data message newContract sanityChecks noDataEip155 dataEip155"

liskSignTransaction_subtests="liskSignTxTransfer liskSignTxTransferWithData liskSignTxSecondSignature liskSignTxDelegateRegistration liskSignTxCastVotes liskSignTxMultisignature"

nemSignTransactionMosaic_subtests="supplyChange creation creationProperties creationLevy"
nemSignTransactionMultisig_subtests="aggregateModification multisig multisigSigner"
nemSignTransactionOthers_subtests="importanceTransfer provisionNamespace"
nemSignTransactionTransfers_subtests="simple xemAsMosaic unknownMosaic knownMosaic knownMosaicWithLevy multipleMosaics"

getAccountInfo_subtests="firstSegwitAccount firstLegacyAccount emptyAccount segwitAccountFromDescriptor legacyAccountFromDescriptor ethereumAccount ethereumAccountFromDescriptor rippleAccount rippleAccountFromDescriptor invalidPath"

# passphrase_subtests="correctPassphrase wrongPassphrase"
################# Possible subtests: END


################# General functions
cleanup() {
    cd $base_path

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

    echo "${red}${bold}Error - $description:$reset $error_message"
}

show_usage() {
    echo "Usage: run [OPTIONS] [ARGS]"
    echo ""
    echo "Options:"

    echo "  -a                                  Run all available tests"
    echo "  -t \"<,TEST_NAME/SUBTEST_NAME>\"      Run specified tests/subtest"
    echo "  -x \"<,TEST_NAME>\"                   Run all but specified tests"
    echo "  -m                                  Run on a physical device"
    echo "  -l                                  Show all available tests and exit."
    echo "  -s <TEST_NAME>                      Show all available subtests for the specified test name and exit."
    echo "  -e                                  Specify path to emulator"
    echo "  -b                                  Specify path to transport"
    echo "  -p                                  Show default paths to emulator and transport and exit"
    echo "  -d                                  Print karma debug messages while running tests"
    echo "  -k                                  Print emulator debug messages while running tests"
    echo "  -h                                  Show this message and exit"
}

show_available_subtests_for_test() {
    test_name=$1
    subtests=${test_name}_subtests

    if [ -n "${!subtests}" ]; then
        echo "Following subtests for '${test_name}' are available:"
        for subtest in ${!subtests}; do
            echo "  ${green}-${reset} $subtest"
        done;
        echo "Usage to run specific test: 'run -t \"testName/subtestName\"'"
    else
        echo " ${yellow}-${reset} Test '${test_name}' has no subtests."
    fi;
}

show_available_tests() {
    echo "Following tests are available:"
    for test in $available_tests; do
        echo "${green}-${reset} $test"

        subtests=${test}_subtests
        for subtest in ${!subtests}; do
            echo "  ${green}-${reset} $subtest"
        done;
    done;

    echo "Usage to run specific test: 'run -t \"[testName/subtestName]\"'"
}

show_default_paths() {
    echo "Default paths:"
    echo "  emulator:   '${emulator_path}'"
    echo "  transport:  '${trezord_path}'"
}
################# General functions: END


################# Validation functions
validate_subtest_name_for_test() {
    subtest_name=$1
    test_name=$2

    # First check whether test has any subtests at all
    subtests=${test_name}_subtests
    if [ -n "${!subtests}" ]; then
        # Test has some subtests
        # Now check whether subtest name is valid
        subtest_name_checked=$(echo "${!subtests}" | grep -ow "$subtest_name")
        if [ -z "${subtest_name_checked}" ]; then
            log_error "Invalid subtest name" "'${subtest_name}'"
            echo "Use ${yellow}-l${reset} option too see all available tests"
            cleanup
        fi;
    else
        log_error "Specified test doesn't have any subtests" "'${test_name}'"
        echo "Use ${yellow}-l${reset} option too see all available tests"
        cleanup
    fi;
}

validate_test_names() {
    test_names=$1

    # Checks whether 'test_names' are actually name of available tests
    for test in $test_names; do
        # Add trailing '/' so the cut command works for $subtest_name
        # if $test is only name of the test without '/' (i.e.: test=ethereumSignTransaction)
        # the $subtest_name would be same as the $test_name
        test_name=$(echo ${test}/ | cut -d"/" -f1)
        subtest_name=$(echo ${test}/ | cut -d"/" -f2)

        # Validate test name
        test_name_checked=$(echo "$available_tests" | grep -ow "$test_name")
        if [ -n "$test_name_checked" ]; then
            # If the subtest name is present validate it
            if [ -n "$subtest_name" ]; then
                validate_subtest_name_for_test $subtest_name $test_name
            fi;

            if [ "$run_type" = "specified" ]; then
                tests_to_run="$tests_to_run $test"
            elif [ "$run_type" = "excluded" ]; then
                if [ -n "$subtest_name" ]; then
                    subtests_not_to_run="$subtests_not_to_run $test"
                else
                    tests_not_to_run="$tests_not_to_run $test"
                fi;
            fi;
        else
            log_error "invalid test name" "'$test_name'"
            echo "Use ${yellow}-l${reset} option too see all available tests"
            cleanup
        fi;
    done;
}
################# Validation functions: END


################# Device + transport functions
kill_emul_transport() {
    is_running_emul=$(ps $pid_emul > /dev/null && echo 1 || echo 0)
    is_running_transport=$(ps $pid_transport > /dev/null && echo 1 || echo 0)

    if [ $is_running_transport -eq 1 ]; then
        kill -TERM $pid_transport
        wait $pid_transport > /dev/null 2>&1
    fi;

    if [ $is_running_emul -eq 1 ]; then
        kill -TERM $pid_emul
        wait $pid_emul > /dev/null 2>&1
    fi;
}

start_emulator() {
    # Start emulator
    cd $emulator_path

    if [ $should_print_emulator_debug == "true" ]; then
        PYOPT=0 ./emu.sh &
        pid_emul=$!
    else
        PYOPT=0 ./emu.sh > /dev/null 2>&1 &
        pid_emul=$!
    fi;
}

start_transport() {
    cd $trezord_path
    #./trezord-go -e 21324 > /dev/null 2>&1 &
    #./trezord-go -e 21324 -e 21325 > /dev/null 2>&1 &
    ./trezord-go -ed 21324:21325 > /dev/null 2>&1 &
    #./trezord-go -e 21324 -e 21325 &
    #./trezord-go -e 21325 > /dev/null 2>&1 &
    #./trezord-go &
    # You can disable all USB in order to run on some virtuaized environments, for example Travis
    # doesn't check for devices connected via USB, only for emulator
    # ./trezord -e 21324 -u=false

    #./trezord-go -e 21324 -e 21325 2>&1 > /dev/null &
    pid_transport=$!
}

init_device() {
    passphrase_enabled="$1" # True/False

    cd $base_path
    if [ "$passphrase_enabled" == "True" ]; then
        python3 ./src/__tests__/init_device.py -m "${mnemonic_12}" -p "${pin_0}" --passphrase 2>&1 > /dev/null
    else
        python3 ./src/__tests__/init_device.py -m "${mnemonic_12}" -p "${pin_0}" --no-passphrase 2>&1 > /dev/null
    fi;
}

prepare_environment() {
    enable_passphrase="$1" # "True"/"False"

    if [ "${should_start_emulator}" = "true" ]; then
        start_emulator
        sleep 2
        init_device "${enable_passphrase}"
    fi
    start_transport
}
################# Device + transport functions: END


################# Test execution functions
run_karma() {
    cd $base_path

    path_babel_node="./node_modules/.bin/babel-node"
    path_karma="./node_modules/karma/bin/karma"

    ${path_babel_node} ${path_karma} start --tests="${1}" --isEmulatorRunning="${should_start_emulator}" --printDebug="${should_print_karma_debug}"
}

all_tests() {
    echo "${green}${bold}Running all tests...${reset}"
    # for t in $available_tests; do
    #     run_test $t
    # done

    run_tests "${available_tests}"
}

specified_tests() {
    run_tests "$1"
}

excluded_tests() {
    not_to_run="$1"

    echo "${yellow}${bold}Excluded tests: ${not_to_run}${reset}"
    echo "${green}${bold}Running all other tests...${reset}"

    # Filter tests
    echo "${available_tests}" | tr " " "\n" | sort > "./tmp1.$$.txt"
    echo "${not_to_run}" | tr " " "\n" | sort > "./tmp2.$$.txt"
    to_run=$(comm -23 "./tmp1.$$.txt" "./tmp2.$$.txt" | tr "\n" " ")
    rm -f "./tmp1.$$.txt"
    rm -f "./tmp2.$$.txt"

    run_tests "${to_run}"
}

run_tests() {
    test_names="$1"

    will_run_passphrase="false"

    # First loop through all tests and check whether a passphrase test will run
    test_names_filtered=""
    for test_name in $test_names; do
        # Check whether specified test was specified also with a subtest
        # - trailing '/' must be added so the cut command works for $subtest_to_run
        # - if $test is only name of the test without '/' (i.e.: 'test=ethereumSignTransaction' not 'test=ethereumSignTransaction/')
        # the $subtest_to_run would be same as the $test_to_run
        test_to_run=$(echo ${test_name}/ | cut -d"/" -f1)
        subtest_to_run=$(echo ${test_name}/ | cut -d"/" -f2)

        if [ $test_to_run = "passphrase" ]; then
            # Run passphrse test first because it has a different environment
            will_run_passphrase="true"
        else
            test_names_filtered="${test_names_filtered} ${test_name}"
        fi
    done;

    if [ ${will_run_passphrase} = "true" ]; then
        prepare_environment "True"
        # Run karma with passphrase as the only test
        run_karma "passphrase"
        kill_emul_transport
    fi

    # If any additional tests are left can run now
    if [ -n "${test_names_filtered}" ]; then
        prepare_environment "False"
        run_karma "${test_names_filtered}"
        kill_emul_transport
    fi
}
################# Test execution functions: END




################# Script execution starts here #################
# Show help if no option provided
if [ $# -eq 0 ]; then
    show_usage
    cleanup
fi;

# The emulator device is configured for each specific test automatically
OPTIND=1
while getopts ":at:x:ls:e:b:kmpdh" opt; do
    case $opt in
        a) # Run all tests
            run_type="all"
        ;;
        t) # Run specified tests
            run_type="specified"
            validate_test_names "$OPTARG"
        ;;
        x) # Exclude tests that shouldn't run (i.e. run all but specified tests)
            run_type="excluded"
            validate_test_names "$OPTARG"
        ;;
        l) # Show available tests
            show_available_tests
            cleanup
        ;;
        s) # Show subtests for the specified test
            show_available_subtests_for_test "$OPTARG"
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
        d) # Print debug messages from Karma
            should_print_karma_debug="true"
        ;;
        k) # Print debug messages from emulator
            should_print_emulator_debug="true"
        ;;
        m) # Start tests without emulator - testing on a physical device
            should_start_emulator="false"
        ;;
        \?)
            log_error "invalid option" $OPTARG
            cleanup
        ;;
    esac
done
shift $((OPTIND-1))

if [ "$run_type" = "all" ]; then
    all_tests
elif [ "$run_type" = "specified" ]; then
    specified_tests "$tests_to_run"
elif [ "$run_type" = "excluded" ]; then
    excluded_tests "$tests_not_to_run"
fi;

cleanup
