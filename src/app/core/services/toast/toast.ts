import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastType } from '../../models/enums/toast-type';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

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