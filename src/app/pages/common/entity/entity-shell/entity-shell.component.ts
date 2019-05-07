import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { FormControl } from '@angular/forms'
import { Subscription, Subject } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material';

import { WebSocketService, ShellService } from '../../../../services/';
import { TranslateService } from '@ngx-translate/core';
import {TooltipComponent} from '../entity-form/components/tooltip/tooltip.component';
import { T } from '../../../../translate-marker';
import { DisplayOption } from 'ng-terminal/lib/display-option';
import { NgTerminalComponent } from 'ng-terminal';
import { NgTerminal } from 'ng-terminal/lib/ng-terminal';
import { Terminal } from 'xterm';

export interface Shellconfiguration {
  initialCommand?: string,
  jailId?: string,
  noInput?: boolean,
}

@Component({
  selector: 'entity-shell',
  templateUrl: './entity-shell.component.html',
  styleUrls: ['./entity-shell.component.css'],
  providers: [ShellService],
})

export class EntityShellComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  
  // sets the shell prompt
  @Input() prompt = '';
  @Input('conf') conf: Shellconfiguration;
  @Input('title') title = T("Shell");
  //xter container
  @ViewChild(NgTerminalComponent) child: NgTerminal;
  // xterm variables
  cols: string;
  rows: string;
  font_size: number;
  public token: any;
  public underlying: Terminal;
  public resizable = true;
  public fixed = true;
  private shellSubscription: any;
  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();

  public shell_tooltip = T('<b>Ctrl+C</b> kills a foreground process.<br>\
                            Many utilities are built-in:<br> <b>Iperf</b>,\
                            <b>Netperf</b>, <b>IOzone</b>, <b>arcsat</b>,\
                            <b>tw_cli</b>, <br><b>MegaCli</b>,\
                            <b>freenas-debug</b>, <b>tmux</b>,\
                            <b>Dmidecode</b>.<br> Refer to the <a\
                            href="%%docurl%%/cli.html"\
                            target="_blank">Command Line Utilities</a>\
                            chapter in the guide for usage information\
                            and examples.');

  clearLine = "\u001b[2K\r"
  public shellConnected: boolean = false;
  writeSubject = new Subject<string>();
  public displayOption: DisplayOption = {};
  public displayOptionBounded: DisplayOption = {};
  keyInput: string;

  ngOnInit() {
    this.rowsControl.setValue(30);
    this.colsControl.setValue(100);
  }

  ngOnDestroy() {
    if (this.ss.connected){
      this.ss.socket.close();
    }
    if(this.shellSubscription){
      this.shellSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(){
    this.underlying = this.child.underlying;
    this.getAuthToken().subscribe((res) => {
      this.initializeWebShell(res);
      this.shellSubscription = this.ss.shellOutput.subscribe((value) => {
        if (value !== undefined) {
          this.child.write(value);
        }
      });
    });
    this.invalidate();
    this.child.keyInput.subscribe((input) => {
      this.ss.send(input);
    })
    this.rowsControl.valueChanges.subscribe(()=> {this.invalidate()});
    this.colsControl.valueChanges.subscribe(()=> {this.invalidate()});
  }

  invalidate() {
    if(this.resizable) {
      this.displayOption.activateDraggableOnEdge = {minWidth: 100, minHeight: 100};
    } else {
      this.displayOption.activateDraggableOnEdge = undefined;
    } if(this.fixed) {
      this.displayOption.fixedGrid = {rows: this.rowsControl.value, cols: this.colsControl.value};
    } else {
      this.displayOption.fixedGrid = undefined;
    }
    this.child.setDisplayOption(this.displayOption);
  }
  
  resizableChange(event: MatSlideToggleChange){
    this.resizable = event.checked;
    if(this.resizable) {
      this.fixed = false;
    }
    this.invalidate();
  }

  fixedChange(event: MatSlideToggleChange){
    this.fixed = event.checked;
    if(this.fixed) {
      this.resizable = false;
    }
    this.invalidate();
  }

  write(){
    this.writeSubject.next(this.inputControl.value);
  }

  onResize(event){
    // this.resizeTerm();
  }

  resetDefault() {
    this.font_size = 14;
  }

  ngOnChanges(changes: {
    [propKey: string]: SimpleChange
  }) {
    const log: string[] = [];
    for (const propName in changes) {
      const changedProp = changes[propName];
      // reprint prompt
      if (propName === 'prompt' && this.child != null) {
        this.child.write(this.clearLine + this.prompt)
      }
    }
  }


  onKeyInput(event: string){
    this.keyInput = event;
  }

  get displayOptionForLiveUpdate(){
    return JSON.parse(JSON.stringify(this.displayOption));
  }


  initializeWebShell(res: string) {
    this.ss.token = res;
    this.ss.connect();

    this.ss.shellConnected.subscribe((res)=> {
      this.shellConnected = res;
    })
  }

  getAuthToken() {
    return this.ws.call('auth.generate_token');
  }

  reconnect() {
    this.ss.connect();
  }

  constructor(private ws: WebSocketService, public ss: ShellService, public translate: TranslateService) {
  }
}
