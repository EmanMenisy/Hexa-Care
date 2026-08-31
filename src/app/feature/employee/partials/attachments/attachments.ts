import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
const MAX_SIZE_MB = 30;
@Component({
  selector: 'app-attachments',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
})
export class Attachments {
  label = input<string>('employee.documents.image');
  optional = input<boolean>(true);

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragging = signal(false);
  errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onBrowseClick(input: HTMLInputElement) {
    input.click();
  }

  onFileInputChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  removeFile() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.errorMessage.set(null);
    this.fileRemoved.emit();
  }

  private handleFile(file: File) {
    this.errorMessage.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set('employee.documents.invalid_type');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.errorMessage.set('employee.documents.exceeds_size');
      return;
    }

    this.selectedFile.set(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null); // PDF: مفيش preview صورة
    }

    this.fileSelected.emit(file);
  }
}
