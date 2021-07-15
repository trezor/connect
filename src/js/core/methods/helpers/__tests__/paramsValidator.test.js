import { validateParams } from '../paramsValidator';

const fixtures = [
    {
        description: 'array',
        type: 'array',
        value: [],
        success: true,
        allowEmpty: true,
    },
    {
        description: 'array invalid (empty)',
        type: 'array',
        value: [],
    },
    {
        description: 'array-buffer',
        type: 'array-buffer',
        value: new ArrayBuffer(0),
        success: true,
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: Buffer.from('foo'),
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: [],
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: 'foo',
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: 0,
    },
];
describe('helpers/paramsValidator', () => {
    fixtures.forEach(f => {
        it(f.description, () => {
            if (!f.success) {
                expect(() =>
                    validateParams({ param: f.value }, [{ name: 'param', ...f }]),
                ).toThrow();
            } else {
                expect(() =>
                    validateParams({ param: f.value }, [{ name: 'param', ...f }]),
                ).not.toThrow();
            }
        });
    });
});
