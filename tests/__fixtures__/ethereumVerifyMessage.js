export default {
    method: 'ethereumVerifyMessage',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'short message',
            params: {
                address: 'cb3864960e8db1a751212c580af27ee8867d688f',
                signature: 'b7837058907192dbc9427bf57d93a0acca3816c92927a08be573b785f2d72dab65dad9c92fbe03a358acdb455eab2107b869945d11f4e353d9cc6ea957d08a871b',
                message: 'This is an example of a signed message.',
            },
            result: {
                message: 'Message verified',
            },
        },
        {
            description: 'long message',
            params: {
                address: 'cb3864960e8db1a751212c580af27ee8867d688f',
                signature: 'da2b73b0170479c2bfba3dd4839bf0d67732a44df8c873f3f3a2aca8a57d7bdc0b5d534f54c649e2d44135717001998b176d3cd1212366464db51f5838430fb31c',
                message: 'VeryLongMessage!'.repeat(64),
            },
            result: {
                message: 'Message verified',
            },
        },
    ],
};
