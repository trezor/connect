import fs from 'fs';
import less from 'less';
import LessPluginAutoPrefix from 'less-plugin-autoprefix';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import { STYLE_SRC, INLINE_STYLESHEET } from './constants';

export default function compile() {

    const file = STYLE_SRC + "iframe/index.less";
    console.log("Read less file:", file)

    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
        if(err) throw err;

        // consider https://github.com/bassjobsen/less-plugin-css-flip
        const autoprefixPlugin: LessPluginAutoPrefix = new LessPluginAutoPrefix();
        const cleanCSSPlugin: LessPluginCleanCSS = new LessPluginCleanCSS({advanced: true});
        const lessOptions: Object = {
            sourceMap: { sourceMapFileInline: true },
            plugins: [ autoprefixPlugin, cleanCSSPlugin ]
        }

        less.render(data.toString(), lessOptions).then(function(output){
            var clean = output.css;
            var wrapper = "const css=`" + clean + "`; export default css;";
            //fs.writeFile(file + ".js", wrapper, { encoding: 'utf8' }, callback);
            fs.writeFile(INLINE_STYLESHEET + "inline-styles.js", wrapper, { encoding: 'utf8' }, () =>{
                console.log("CSS compiled. Saved as " + INLINE_STYLESHEET + "inline-styles.js");
            });
        }).catch(function(error) {
            console.log(error);
        });

    });
}
