import * as vscode from 'vscode';
import { exec,spawn } from 'child_process';
import { readFileSync } from 'fs';
import { DOMParser } from "xmldom";

export default class Blamer{
    editor;
    path:string='';
    revisionMaxLen=0;
    authorMaxLen=0;
    blameLines = new Map();
    blameVersions = new Map();
    blameInfos = new Map();
    revisions:string[] = [];
    svnCmd='/usr/local/bin/svn';
    decorations:any[]= new Array();

    constructor(path:string=''){
        this.editor = vscode.window.activeTextEditor;
        this.path=path;
        console.log('init'+path);
        if (!path) {
            vscode.window.showErrorMessage('No file selected!');
            return;
        }
    }
    showBlameProcess(title:string='') {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title || 'Processing...',
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Progress cancelled.');
            });
            return new Promise(resolve => {
                // progress.report({increment:100});
                this.getBlame(progress).then((revisions) => {
                    resolve(revisions);
                });
            });
        });
    }

    showGutter() {
        console.log(`showGutter ${this.path}`);
        if (this.editor) {
            // 设置行号可见性
            this.editor.options = {
                ...this.editor.options,
                lineNumbers: vscode.TextEditorLineNumbersStyle.On
            };
            this.showBlameProcess('Processing for get blame info').then((revisions) => {
                console.log(`Processing for get log ${revisions}`);
                // fetch log for each revision
                return vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Processing for get log',
                    cancellable: true
                }, (progress, token) => {
                    token.onCancellationRequested(() => {
                    });
                    const promises = this.revisions.map((revision:string) => this.getLog(revision));
                    return Promise.all(promises).then(() => {
                        progress.report({increment:100});
                    });
                });
            }).then(() => {
                // setDecorationOptions;
                this.setLineDecoration();
            });
        }
    }
    getBlame(progress:vscode.Progress<{ increment: number }>){
        const filePath=this.path;
        return new Promise(resolve => {
            const process = spawn(`${this.svnCmd} blame --xml "${filePath}"`, { shell:true });
            let [stdout, stderr] = ['', ''];
            process.stderr.on('data', data => { stderr += data.toString(); });
            process.stdout.on('data', data => { stdout += data.toString(); });
            process.stdout.on('close', (code:string) => {
                if (stderr || code) {
                    throw new Error(stderr);
                } else {
                    resolve( this.getRevisions(stdout,progress) );
                }
            });
            
        });
    }
    getRevisions(stdout:string,progress:vscode.Progress<{ increment: number }>) {
        console.log('getRevisions');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(stdout, "text/xml");
        const elements = xmlDoc.getElementsByTagName('entry');
        const ellen = elements.length;
        let revisions=new Array();
        for (let index = 0; index < ellen; index++) {
            const element = elements[index];
            const date = new Date(element.getElementsByTagName('date')[0].textContent || '').toLocaleString(),
                lineNumber:string = element.getAttribute('line-number') || '0',
                author:string = element.getElementsByTagName('author')[0].textContent || '',
                rvision:string = element.getElementsByTagName('commit')[0].getAttribute('revision') || '0',
                msg:string='';
            let entry = { author, rvision, lineNumber, date ,msg};
            this.authorMaxLen = entry.author.length>this.authorMaxLen?entry.author.length:this.authorMaxLen;
            this.revisionMaxLen = entry.rvision.toString().length>this.revisionMaxLen?entry.rvision.toString().length:this.revisionMaxLen;
            lineNumber && this.blameLines.set(lineNumber,rvision) && this.blameVersions.set(rvision,entry);
            lineNumber && revisions.push(rvision);
        }
        this.revisions = revisions.filter((item, index) => revisions.indexOf(item) === index);
        progress.report({increment:100});
        return this.revisions;
    }
    getLog(revision:string){
        console.log(`${this.svnCmd} log --xml -r${revision} ${this.path}`);
        return revision.length &&  new Promise((resolve, reject) => {
            const process = spawn(`${this.svnCmd} log --xml -r${revision} ${this.path}`, { shell:true });
            let [stdout, stderr] = ['', ''];
            process.stderr.on('data', data => { stderr += data.toString(); });
            process.stdout.on('data', data => { stdout += data.toString(); });
            process.stdout.on('close', (code:string) => {
                if (stderr || code) {
                    reject(stderr);
                } else {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(stdout, 'text/xml');
                    let msg = xml.getElementsByTagName('msg')[0].textContent || '';
                    const entry = this.blameVersions.get(revision);
                    if (!entry) {
                        reject(`revision:${revision} fetch failed!`);
                    }else{
                        entry.msg = msg;
                        console.log(msg,entry);
                        entry.image = '';//////TODO
                        this.blameVersions.set(revision,entry);
                        // console.log( this.blameVersions );
                        resolve(this.blameVersions);
                    }
                }
            });
        });
    }
    setLineDecoration(){
        const editor =this.editor;
        if(!editor){
            return '';
        }
        console.log('setLineDecoration');
        const extensionPath = vscode.extensions.getExtension('newnight.snailsvn')?.extensionPath;
        this.blameLines.forEach((version, line) => {
            // let decoration;
            const {author, rvision, lineNumber, date ,msg,image} = this.blameVersions.get(version);
            let decoration = vscode.window.createTextEditorDecorationType({
                // isWholeLine: true,
                after: {
                    margin: '0 0 0 3em',
                    textDecoration:'none'
                }
            });

            this.decorations.push(decoration);
            editor.setDecorations(decoration, [{
                range: new vscode.Range(parseInt(line), 0, parseInt(line), 1000),//TODO
                hoverMessage: new vscode.MarkdownString(`👁 ${rvision}: ${author}\n\n${date}\n\n${msg}`)
            }]);
        });
    }
}