import { Component, Input } from '@angular/core';
import { ToastsService } from '../../../services/toasts.service';


@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  // @Input() autohide  = true;
  // @Input() delay  = 3000;
  // @Input() message  = "";

  constructor(
    public toastsService: ToastsService
  ) { }

}
