import { Component, ElementRef, ViewChild, inject, input, signal, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AttachmentRow } from '../../model/employee-creation';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";
import { Localization } from '../../../../core/services/localization/localization';
import { EmployeeCreationService } from '../../service/employee-creation-service';



@Component({
  selector: 'hexa-attachments',
  imports: [CommonModule, TranslatePipe, FormsModule, ButtonComponent],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
})
export class Attachments {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  private translate = inject(Localization);
  private employeeCreation = inject(EmployeeCreationService);
  private destroyRef = inject(DestroyRef);
  ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
  MAX_SIZE = 30 * 1024 * 1024; // 30 MB

  label = '';
  items = signal<AttachmentRow[]>([]);
  error = signal<string | null>(null);
  existingAttachments = input<AttachmentRow[]>([]);
  removedExistingIds = signal<string[]>([]);

  // Tracks per-row download state so we can disable/show a spinner on the link while the blob is being fetched
  downloadingIds = signal<Set<string>>(new Set());

  private mergedExisting = false;

  constructor() {
    effect(() => {
      const existing = this.existingAttachments();
      if (existing.length && !this.mergedExisting) {
        this.mergedExisting = true;
        this.items.update((current) => [...existing, ...current]);
      }
    });
  }

  triggerUpload(): void {
    this.error.set(null);
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.error.set(
        this.translate.instant('employee.documents.unsupported_type', { fileName: file.name })
      );
      return;
    }
    if (file.size > this.MAX_SIZE) {
      this.error.set(
        this.translate.instant('employee.documents.file_too_large', { fileName: file.name })
      );
      return;
    }

    this.items.update((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: this.label || this.translate.instant('employee.documents.default_label'),
        file,
        date: new Date(),
      },
    ]);
    this.label = '';
  }

  removeItem(id: string): void {
    const item = this.items().find((i) => i.id === id);
    if (!item) return;

    if (item.isExisting) {
      this.deleteExistingAttachment(item);
      return;
    }

    this.items.update((current) => current.filter((i) => i.id !== id));
  }

  private deleteExistingAttachment(item: AttachmentRow): void {
    this.employeeCreation.deleteAttachment(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.items.update((current) => current.filter((i) => i.id !== item.id));
        },
      });
  }

  getAttachments(): { file: File; title: string }[] {
    return this.items()
      .filter((i): i is AttachmentRow & { file: File } => !!i.file)
      .map(({ file, label }) => ({ file, title: label }));
  }

  getRemovedAttachmentIds(): string[] {
    return this.removedExistingIds();
  }

  // Existing attachments (isExisting = true) only carry a fileUrl/id from the backend — no File object in memory —
  // so they must be fetched as a Blob first. Locally-added attachments already have the File object, so they
  // download straight from memory without hitting the server.
  downloadFile(item: AttachmentRow): void {
    if (item.isExisting) {
      this.downloadExistingAttachment(item);
      return;
    }

    if (item.file) {
      this.saveBlob(item.file, item.file.name);
    }
  }

  private downloadExistingAttachment(item: AttachmentRow): void {
    if (this.downloadingIds().has(item.id)) return; // avoid double-clicks while a download is already in flight

    this.downloadingIds.update((current) => new Set(current).add(item.id));

    this.employeeCreation.downloadAttachment(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.saveBlob(blob, item.fileUrl || item.label || 'document');
          this.stopDownloading(item.id);
        },
        error: () => {
          this.stopDownloading(item.id);
        },
      });
  }

  private stopDownloading(id: string): void {
    this.downloadingIds.update((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}