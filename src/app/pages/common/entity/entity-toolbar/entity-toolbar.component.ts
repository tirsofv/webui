import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CoreComponents } from 'app/core/components/corecomponents.module';
import { 
  ViewControllerComponent, 
  ViewControllerMetadata,
} from 'app/core/components/viewcontroller/viewcontroller.component';
import { ViewButtonComponent } from 'app/core/components/viewbutton/viewbutton.component';
import { DesktopMenuComponent } from 'app/core/components/desktopmenu/desktopmenu.component';

@Component({
  selector:'entity-toolbar',
  template: ViewControllerMetadata.template,
  //template:`<h4>Entity-Toolbar template</h4>`,
  //templateUrl:'./entity-toolbar.component.html',
  styleUrls:['./entity-toolbar.component.css']
})
export class EntityToolbarComponent extends ViewControllerComponent implements AfterViewInit{

  public orientation?: string = 'horizontal';

  constructor(){
    super();

    this.controlEvents.subscribe((evt) => {
      console.log(evt);
    })
  }

  ngAfterViewInit(){

    // Button Example
    let btn1 = this.create(ViewButtonComponent);
    btn1.target = this.controlEvents;
    btn1.label = "TEST";
    btn1.tooltipEnabled = true;
    btn1.tooltipText = "Just a test folks.";
    btn1.action = {name:"Success"}
    console.log(btn1);
    this.addChild(btn1);

    // Desktop Style Menu Example
    let menu1 = this.create(DesktopMenuComponent);
    menu1.target = this.controlEvents;
    menu1.label = "Desktop Menu";
    this.addChild(menu1);
  }

  //ngOnDestroy(){}
}
