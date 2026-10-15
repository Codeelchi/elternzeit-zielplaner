import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const htmlPath=resolve(root,'index.html');
const inputs=[
 {start:'/* V38_STYLES_START */',end:'/* V38_STYLES_END */',src:'src/v38-quickstart.css'},
 {start:'<!-- V38_MARKUP_START -->',end:'<!-- V38_MARKUP_END -->',src:'src/v38-quickstart.html'},
 {start:'/* V38_RUNTIME_START */',end:'/* V38_RUNTIME_END */',src:'src/v38-quickstart.js'}
];
let html=readFileSync(htmlPath,'utf8');
for(const item of inputs){
 const body=readFileSync(resolve(root,item.src),'utf8');
 if(item.src.endsWith('.js')&&body.includes('</script'))throw Error('Script break-out sequence in quickstart');
 const before=html.indexOf(item.start),after=html.indexOf(item.end);
 if(before<0||after<before||html.indexOf(item.start,before+1)!==-1||html.indexOf(item.end,after+1)!==-1)throw Error('Missing/duplicate V3.8 markers: '+item.src);
 const expected=item.start+'\n'+body+'\n'+item.end;
 html=html.slice(0,before)+expected+html.slice(after+item.end.length);
}
const before=readFileSync(htmlPath,'utf8');
if(process.argv.includes('--check')){
 if(html!==before){console.error('Quickstart snapshot differs: run npm run quickstart:sync');process.exitCode=1;}
 else console.log('Quickstart HTML/CSS/JS snapshot synchronized');
}else{
 if(html!==before)writeFileSync(htmlPath,html);
 console.log('Quickstart embedded into offline HTML');
}