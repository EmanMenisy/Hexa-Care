import { Injectable } from '@angular/core';
import { ToastType } from '../../models/enums/toast-type';
import { MessageService } from 'primeng/api';
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private readonly messageService: MessageService) {
    // This is intentional
  }

  addToast(
    key: ToastType,
    summary: string,
    detail: string,
    data?: any,
    closable: boolean = false,
    sticky: boolean = false
  ): void {
    this.messageService.add({
      key: key,
      severity: 'custom',
      summary: summary,
      detail: detail,
      closable: closable,
      sticky: sticky,
      data: data,
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}
