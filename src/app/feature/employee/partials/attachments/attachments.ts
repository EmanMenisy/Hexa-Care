import { Component, ElementRef, ViewChild, inject, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AttachmentRow } from '../../model/employee-creation';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";
import { Localization } from '../../../../core/services/localization/localization';
import { EmployeeCreationService } from '../../service/employee-creation-service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
const MAX_SIZE = 30 * 1024 * 1024; // 30 MB

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
   
  label = '';
  items = signal<AttachmentRow[]>([]);
  error = signal<string | null>(null);
  existingAttachments = input<AttachmentRow[]>([]);
  removedExistingIds = signal<string[]>([]);

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set(
        this.translate.instant('employee.documents.unsupported_type', { fileName: file.name })
      );
      return;
    }
    if (file.size > MAX_SIZE) {
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
    this.employeeCreation.deleteAttachment(item.id).subscribe({
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

  downloadFile(item: AttachmentRow): void {
    if (item.file) {
      const url = URL.createObjectURL(item.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.file.name;
      link.click();
      URL.revokeObjectURL(url);
    } else if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    }
  }
}