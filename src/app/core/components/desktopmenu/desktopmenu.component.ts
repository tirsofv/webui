import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../appMaterial.module';
import { ViewControlComponent } from 'app/core/components/viewcontrol/viewcontrol.component';
import { CoreEvent } from 'app/core/services/core.service';

export interface DesktopMenuConfig {
  label:string;
  action?: CoreEvent;
  submenu?: DesktopMenu;
}

export interface DesktopMenu {
  config: DesktopMenuConfig;
}

@Component({
  selector: 'desktop-menu',
  templateUrl: './desktopmenu.component.html',
  styleUrls: ['./desktopmenu.component.css']
})
export class DesktopMenuComponent extends ViewControlComponent implements OnInit {
  
  /*
   * NOTE TO SELF:
   * Redo this is with the following structure
   * DesktopMenu = ViewController
   * DesktopMenuItem = ViewControl;
   */


  readonly componentName = DesktopMenuComponent;
    
  public label: string = 'Button';
  public open: boolean =  false;
  public tooltipEnabled:boolean = false;
  public tooltipText: string;
  public tooltipPlacement: string;

  // JSON : (default is example content)
  public tree: any = {
    item1: {label: "One"},
    item2: {label: "Two"},
    item3: {
      label:"Submenu",
      submenu: {
        item1:{label: "One"},
        item2: {label: "Two"}
      }
    }
  } 

  constructor() {
    super();
    this.climbTree()
  }

  toggleOpen(){
    this.open = !this.open;
  }

  protected climbTree(){
    const trunk = Object.keys(this.tree);
    console.warn(trunk);
  }

  ngOnInit() {
  }

}
