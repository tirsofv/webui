import { Component, OnInit, OnDestroy, ViewChild, ElementRef, OnChanges, Input, SimpleChange } from '@angular/core';
import { WebSocketService, ShellService } from '../../services/';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';

import { T } from '../../translate-marker';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
selector: 'app-shell',
templateUrl: './shell.component.html',
styleUrls: ['./shell.component.css'],
providers: [ShellService],
})

export class ShellComponent implements OnInit, OnDestroy, OnChanges{
    @ViewChild('terminal') container: ElementRef;
    public term: Terminal;
    public shellConnected = false;
    public font_size: number;

    public shell_tooltip = T('<b>Ctrl+C</b> kills a foreground process.<br>\
 Many utilities are built-in:<br> <b>Iperf</b>,\
 <b>Netperf</b>, <b>IOzone</b>, <b>arcsat</b>,\
 <b>tw_cli</b>, <br><b>MegaCli</b>,\
 <b>freenas-debug</b>, <b>tmux</b>,\
 <b>Dmidecode</b>.<br> Refer to the <a\
 href="%%docurl%%/cli.html%%webversion%%"\
 target="_blank">Command Line Utilities</a>\
 chapter in the guide for usage information\
 and examples.');

    @Input() prompt = '';
    clearLine = "\u001b[2K\r"
    constructor(private ws: WebSocketService, private ss: ShellService){
        Terminal.applyAddon(attach);
    }
    
    ngOnInit() {
        this.ws.call('auth.generate_token').subscribe((token) => {
            this.ss.token = token;
            this.ss.connect();
            this.ss.shellConnected.subscribe(
                (res) => {
                    this.initializeTerminal();
                    this.ss.shellConnected.unsubscribe();
                }
            )
        });
    }
    ngOnChanges() {
          console.log('hello');
    }

    getFun() {
        console.log((<any>this.term)._core.wraparoundMode);
        
        console.log((<any>this.term)._core.viewport.scrollBarWidth); // 15
        
        const cellWidth = (<any>this.term)._core.renderer.dimensions.actualCellWidth; // 8.9
        const cellHeight = (<any>this.term)._core.renderer.dimensions.actualCellHeight; //17.775

        console.log(cellWidth, cellHeight);
        
        const availableWidth = this.container.nativeElement.clientWidth;
        const availableHeight = this.container.nativeElement.clientHeight;

        console.log(availableWidth, availableHeight); //685 711

        console.log(availableWidth / cellWidth); // 76.966
        
        let col = Math.floor(availableWidth / cellWidth);
        let row = Math.floor(availableHeight / cellHeight);
        console.log(row, col); //40 76
        
        (<any>this.term)._core.renderer.clear();
        this.term.resize(col, row);
        (<any>this.term)._core.renderer.clear();
        console.log(this.term);
        
    }
    initializeTerminal() {
        this.term = new Terminal({
            cols: 20,
            rows:40,
        });
        (this.term as any).open(this.container.nativeElement, true);
        this.ss.shellOutput.subscribe((value) => {
            if (value !== undefined) {
              this.term.write(value);
            }
          });

        // (this.term as any).attach(this.ss.socket, true, true);
        console.log(this.container.nativeElement.clientWidth, this.container.nativeElement.clientHeight);
        console.log(this.term);
        this.getFun();
        this.term.on('key', (key, ev) => {
            console.log(key.charCodeAt(0));
            if (key.charCodeAt(0) == 13) {
                this.term.write('\n');
            }
            // this.term.write(key);
        });
    this.term.on('data', (data) => {
        console.log(data);
        
        this.ss.send(data);
    });
        
    }

    ngOnDestroy() {
        if (this.ss.connected){
            this.ss.socket.close();
        }
    }

    onResize(event){
        console.log(this.term);
        
    }

    reconnect() {
        this.ss.connect();
    }
}