
const convertFlowToTypescript = (srcFile, destFile) => {
    fse.readFile(srcFile, 'utf8', function (err, data) {
        if (err) return console.log(err);
        const result = data
            .replace('/* @flow */', '')
            .replace(/import type/g, 'import')
            .replace(/\$Shape</g, 'Partial<')
            .replace(/\{\|/g, '{')
            .replace(/\|\}/g, '}')
            .replace(/\?: \?}/g, '?: ')
            .replace(/: \?}/g, '?: ');

        const dest = destFile.replace('.js', '.d.ts');
        fse.writeFile(dest, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
};
