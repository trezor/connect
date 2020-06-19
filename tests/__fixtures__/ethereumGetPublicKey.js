export default {
    method: 'ethereumGetPublicKey',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: "m/44'/60'/0'",
            params: {
                path: "m/44'/60'/0'",
            },
            result: {
                xpub: 'xpub6D54vV8eUYHMVBZCnz4SLjuiQngXURVCGKKGoJrWUDRegdMByLTJKfRs64q3UKiQCsSHJPtCQehTvERczdghS7gb8oedWSyNDtBU1zYDJtb',
            },
        },
        {
            description: "m/44'/60'/0'/0",
            params: {
                path: "m/44'/60'/0'/0",
            },
            result: {
                xpub: 'xpub6Ef8Pj4PmrkTkobADTAMrh9pejCJ3uQUBbBmCemKACT84p8SvsnkcwXb6pgeuYEseAwGkk7xuPmZt6oYnSFLrxvaBpCxjY4Jsg3zU1nuS41',
            },
        },
        {
            description: "m/44'/60'/0'/0/0",
            params: {
                path: "m/44'/60'/0'/0/0",
            },
            result: {
                publicKey: '',
            },
        },
        {
            description: "m/44'/1815'/0'/0/0",
            params: {
                path: "m/44'/1815'/0'/0/0",
            },
            result: {
                xpub: 'xpub6GBpXvAiKQnvjHgC5qSoM3mJs4BGaRHeq8AYUf3bTyEyNx1fwhrDaX17wSwTzyjrbz2N85RLeJZqVsEJtGhsXZNJT7yMZ4mEs5T41jhg8U7',
            },
        },
    ],
};
