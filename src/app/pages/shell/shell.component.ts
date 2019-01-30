import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WebSocketService, ShellService } from '../../services/';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';

import { T } from '../../translate-marker';
import { TranslateService } from '@ngx-translate/core';

@Component({
selector: 'app-shell',
templateUrl: './shell.component.html',
styleUrls: ['./shell.component.css'],
providers: [ShellService],
})

export class ShellComponent implements OnInit, OnDestroy {
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

    initializeTerminal() {
        this.term = new Terminal();
        (this.term as any).open(this.container.nativeElement, true);
        (this.term as any).attach(this.ss.socket, true, true);
    }

    ngOnDestroy() {
        if (this.ss.connected){
            this.ss.socket.close();
        }
    }

    onResize(event){

    }

    reconnect() {
        this.ss.connect();
    }
}