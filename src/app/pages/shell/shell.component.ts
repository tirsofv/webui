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

import { WebSocketService, ShellService } from '../../services/';
import { TranslateService } from '@ngx-translate/core';
import { T } from '../../translate-marker';

@Component({
  selector: 'app-shell',
  template: `<entity-shell [conf]="this" [title]="title"></entity-shell>`,
})

export class ShellComponent { 
  public title = T("Shell");
  
  constructor() {
  }
}
