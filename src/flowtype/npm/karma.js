/* @flow */

import type {
    AvailableTests,
    AvailableSubtests,
} from 'flowtype/tests';

declare var __karma__: {
    config: {
        test: AvailableTests,
        subtest: AvailableSubtests,
    },
};
