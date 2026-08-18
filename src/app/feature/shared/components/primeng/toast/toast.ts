import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToastType } from '../../../../../core/models/enums/toast-type';

@Component({
  selector: 'hexa-toast',
  standalone: true,
  imports: [CommonModule, ToastModule, TranslatePipe],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class ToasterComponent {
  readonly NOTIFICATION_BODY_MAX_CHARS = 70;

  readonly prefixIcon = input<string>('');
  readonly suffixIcon = input<string>('');
  readonly toasterType = input<ToastType>(ToastType.SUCCESS);
  readonly prefixMethod = input<() => void>(() => {});
  readonly suffixMethod = input<() => void>(() => {});

  readonly expandedMap = new Map<string, boolean>();

  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.messageService.messageObserver
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: ToastMessageOptions | ToastMessageOptions[]) => {
        if (!Array.isArray(value) && value.key !== 'notification') return;

        const messages = Array.isArray(value) ? value : [value];

        messages.forEach((message) => {
          const id = message.data?.id;
          if (id && !this.expandedMap.has(id)) {
            this.expandedMap.set(id, false);
          }
        });
      });
  }

  isLongMessage(message: ToastMessageOptions): boolean {
    return (
      !!message.data?.message &&
      message.data.message.length > this.NOTIFICATION_BODY_MAX_CHARS
    );
  }

  isExpanded(message: ToastMessageOptions): boolean {
    return this.expandedMap.get(message.data?.id) ?? false;
  }

  toggle(message: ToastMessageOptions, event: MouseEvent): void {
    event.stopPropagation();
    const id = message.data?.id;
    if (!id) return;
    this.expandedMap.set(id, !this.isExpanded(message));
  }

  getDisplayMessage(message: ToastMessageOptions): string {
    const text = message.data?.message ?? '';

    if (!this.isLongMessage(message) || this.isExpanded(message)) {
      return text;
    }

    return text.slice(0, this.NOTIFICATION_BODY_MAX_CHARS);
  }

  closeToast(message: ToastMessageOptions): void {
    const id = message.data?.id;
    if (id) {
      this.expandedMap.delete(id);
    }
    this.messageService.clear(message.key);
  }
}