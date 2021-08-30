// public keys and signatures generated from "all-all" seed

const PATH = [2147483692, 2147483648, 2147483648, 0, 5];

const inputs = [
    {
        address_n: PATH,
        prev_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
        prev_index: 1,
    },
];

export default [
    {
        description: 'external P2PKH output',
        inputs,
        outputs: [
            {
                address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100a200ea1278c3d32251a63c56f5f0861f48167c61d84de8d951eac1204856ccd402201fc03f446557bcbcef1e473616bb7bddc96561b656b7ddd6b419501543ed5044012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0110270000000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
    },
    {
        description: 'internal P2PKH output',
        inputs,
        outputs: [
            {
                address_n: PATH,
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a47304402203d784f8134a0afe40dfc5ff479a99352110855b845fb4a7524915272cd249f47022079f90d8713035c99a46975d3bca9a8bc2464b02437f09b2cf3d34df91bb53ad2012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0110270000000000001976a914a6450f1945831a81912616691e721b787383f4ed88ac00000000',
        getHDNode: () => ({
            xpub: 'xpub6Ex8WCdj1KH5mK9r99QKENUmhpjEPgYm1dJmKY2nxx16tSAiQCVYjHfymFdzfpYDAHGtWYTif7WkUKLMULRJFPeV1hvEbeXqrM11K85yPjp',
        }),
    },
    {
        description: 'internal P2PKH output (custom path)',
        inputs,
        outputs: [
            {
                address_n: [0],
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a473044022046c0e8694878140567d55665f85fb09c28e07605873c4ebd6b1ed46aac67f0e7022032405c728d8d2726d9b297804882e684c0d5f9ca5df291c4ebca6857056a0eaa012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0110270000000000001976a9144e145e3b27f90d854fba11106654c11451eb960088ac00000000',
        getHDNode: () => ({
            xpub: 'xpub68Zyu13hPwsx8egknnRtfGmk6n9f6S5zbousZUJmQDZsB3GCppTz73oD2WS8DcCa4hqvNePCt8dFt5TKSSBgvCdgg48iWZQ7qgKnFaQnj21',
        }),
    },
    {
        description: 'external P2SH output',
        inputs,
        outputs: [
            {
                address: '3L6TyTisPBmrDAj6RoKmDzNnj4eQi54gD2',
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a47304402203239b33a93c205e1a463304c10383fcfea109012aa7c8b71238c22d2f02dfb98022074f687be14198ca844ab35823dfb70cabbb208338ea7154516a1c657e8b5a3de012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff01102700000000000017a914c9e193b1af9e4349d2ee53b4190e2bd36e59719e8700000000',
    },
    {
        description: 'internal P2SH output',
        inputs,
        outputs: [
            {
                address_n: [2147483697, 2147483648, 2147483648, 0, 5],
                amount: '10000',
                script_type: 'PAYTOP2SHWITNESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a4730440220240b8780aa29f5afa7d9d040ef8c406a9f44f981bf819b01d9e6d68e5a02c59b022020f40e21ef9c3cf6e5f7d4a776593e8bf3971166e1a0324dfdcfcec8c3bce8c0012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff01102700000000000017a9140c598ef0edacdc76bd460441b41d069c62eead278700000000',
        getHDNode: () => ({
            xpub: 'xpub6EnV9K1LzPtRDXqqcDkBk99uCFneHiHR3DBQxXcbuWzQoUGLfJiHeF3uDW1JZH3ZG7mr4TuNtPbgLYwEibEkcDcnQkQksZi7jm3eY8PqKFv',
        }),
    },
    {
        description: 'external P2WPKH output',
        inputs,
        outputs: [
            {
                address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100cdf268cb89433f2cdc990ca3f45bf356befe51bbbbd6b57f1ca08ac69298acad022032beef4e1380bd3819c0cbf1b1a70b434a115199d1cbe5c59de8d94f98086452012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff011027000000000000160014751e76e8199196d454941c45d1b3a323f1433bd600000000',
    },
    {
        description: 'external P2WSH output',
        inputs,
        outputs: [
            {
                address: 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a4730440220714c3704cb9aee785a5e03eb77eacf5bd95d29a4fe9cf33e4a868aa4100d2b6902207c5bdef296404d3fedeaaa71579140768b72c0bea882c7a2f16c029963d7c622012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0110270000000000002200201863143c14c5166804bd19203356da136c985678cd4d27a1b8c632960490326200000000',
    },
    {
        description: 'opreturn output',
        inputs,
        outputs: [
            {
                op_return_data: 'deadbeef',
                amount: '0',
                script_type: 'PAYTOOPRETURN',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100ab05878122fa124067dafccd47b6c55567ed7564ae50676dff89dd9fd920a544022025cdf05643234329fec08fc81abec07e2b9f4e14adfa2e2e507e4debc5d36073012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff010000000000000000066a04deadbeef00000000',
    },
    {
        description: 'opreturn output without amount',
        inputs,
        outputs: [
            {
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100ab05878122fa124067dafccd47b6c55567ed7564ae50676dff89dd9fd920a544022025cdf05643234329fec08fc81abec07e2b9f4e14adfa2e2e507e4debc5d36073012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff010000000000000000066a04deadbeef00000000',
    },
    {
        description: 'Error, output scripts differ',
        inputs,
        outputs: [
            {
                // P2WPKH instead of P2WSH
                address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a4730440220714c3704cb9aee785a5e03eb77eacf5bd95d29a4fe9cf33e4a868aa4100d2b6902207c5bdef296404d3fedeaaa71579140768b72c0bea882c7a2f16c029963d7c622012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0110270000000000002200201863143c14c5166804bd19203356da136c985678cd4d27a1b8c632960490326200000000',
        error: 'verifyTx: Output 0 scripts differ',
    },
    {
        description: 'Error, amount differ',
        inputs,
        outputs: [
            {
                address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
                amount: '20000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100cdf268cb89433f2cdc990ca3f45bf356befe51bbbbd6b57f1ca08ac69298acad022032beef4e1380bd3819c0cbf1b1a70b434a115199d1cbe5c59de8d94f98086452012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff011027000000000000160014751e76e8199196d454941c45d1b3a323f1433bd600000000',
        error: 'verifyTx: Wrong output amount at output 0. Requested: 20000, signed: 10000',
    },
    {
        description: 'Error, wrong length (inputs)',
        inputs: [],
        outputs: [],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100cdf268cb89433f2cdc990ca3f45bf356befe51bbbbd6b57f1ca08ac69298acad022032beef4e1380bd3819c0cbf1b1a70b434a115199d1cbe5c59de8d94f98086452012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff011027000000000000160014751e76e8199196d454941c45d1b3a323f1433bd600000000',
        error: 'verifyTx: Signed transaction inputs invalid length',
    },
    {
        description: 'Error, wrong length (outputs)',
        inputs,
        outputs: [],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100cdf268cb89433f2cdc990ca3f45bf356befe51bbbbd6b57f1ca08ac69298acad022032beef4e1380bd3819c0cbf1b1a70b434a115199d1cbe5c59de8d94f98086452012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff011027000000000000160014751e76e8199196d454941c45d1b3a323f1433bd600000000',
        error: 'verifyTx: Signed transaction outputs invalid length',
    },
    {
        description: 'Error, output without address',
        inputs,
        outputs: [
            {
                amount: '10000',
                script_type: 'PAYTOADDRESS',
            },
        ],
        tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006b483045022100cdf268cb89433f2cdc990ca3f45bf356befe51bbbbd6b57f1ca08ac69298acad022032beef4e1380bd3819c0cbf1b1a70b434a115199d1cbe5c59de8d94f98086452012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff011027000000000000160014751e76e8199196d454941c45d1b3a323f1433bd600000000',
        error: 'deriveOutputScript: Neither address or address_n is set',
    },
];
