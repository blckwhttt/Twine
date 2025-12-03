import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
  Renderer2,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LinkifyService } from '../../../shared/utils/linkify.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full group cursor-text text-white/30 text-[15px]" (click)="focus()">
      <!-- Placeholder Overlay -->
      <span 
        class="absolute inset-0 pointer-events-none leading-normal select-none z-10 flex items-center transition-all duration-75"
        [class.opacity-0]="hasContent"
        [class.opacity-100]="!hasContent"
        [class.translate-x-2]="hasContent"
        [class.translate-x-0]="!hasContent"
      >{{ placeholder }}</span>

      <!-- ContentEditable Div -->
      <div
        #editable
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        spellcheck="false"
        class="w-full max-w-full text-white/90 text-[15px] whitespace-pre-wrap leading-normal bg-transparent transition-colors wrap-break-word overflow-y-auto max-h-[120px] min-h-[20px] custom-scrollbar relative z-20"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        (keyup)="checkContent()"
        (paste)="onPaste($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChatInputComponent),
      multi: true,
    },
  ],
})
export class ChatInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Output() submit = new EventEmitter<void>();

  @ViewChild('editable') editable!: ElementRef<HTMLDivElement>;

  hasContent = false;
  private lastHtml: string = '';
  
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private linkifyService: LinkifyService,
    private renderer: Renderer2,
    private zone: NgZone
  ) {}

  writeValue(value: string): void {
    // This method is called when the model changes programmatically (or initial value)
    const normalizedValue = value || '';
    
    if (this.editable) {
      // Avoid re-rendering if content matches (prevents cursor jump if model updates back)
      this.renderContent(normalizedValue, false); // false = don't save cursor (external update)
    } else {
        // If view is not initialized yet, wait for it
        setTimeout(() => {
             if (this.editable) {
                 this.renderContent(normalizedValue, false);
             }
        });
    }
    this.checkContent(normalizedValue);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFocus(): void {
    this.onTouched();
  }

  onBlur(): void {
    this.checkContent();
  }

  onInput(event: Event): void {
    const el = this.editable.nativeElement;
    const text = el.innerText;
    
    // Trigger change detection
    this.onChange(text);

    // Only re-render if there are links or if we need to clean up structure
    // BUT: re-rendering on every keystroke in contenteditable is risky for cursor.
    // Let's only re-render if we detect a URL pattern match change or strict requirement.
    // For now, to fix the "cursor jump" issue, we can try to be less aggressive.
    // However, the user wants REAL-TIME highlighting.
    
    this.renderContent(text, true);
    
    // Check content state after render
    this.checkContent();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit.emit();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      // Insert text at cursor position
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Insert text node
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      
      // Flatten structure: ensure we don't have nested spans from previous pastes
      this.editable.nativeElement.normalize();

      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input event logic manually
      this.onInput(new Event('input'));
    }
  }

  checkContent(val?: string): void {
    // If a value is provided (e.g. from writeValue), check it directly
    if (val !== undefined) {
      this.hasContent = val.length > 0 && val !== '\n';
      return;
    }

    if (!this.editable) return;
    const el = this.editable.nativeElement;
    
    // DOM-based check for robust "is visually empty" detection
    const hasText = (el.textContent || '').length > 0;
    
    if (hasText) {
        this.hasContent = true;
        return;
    }
    
    // If no text, check for significant HTML elements (newlines, etc)
    const children = el.children;
    if (children.length === 0) {
        this.hasContent = false;
        return;
    }
    
    // Single <br> is considered empty in contenteditable
    if (children.length === 1 && children[0].tagName === 'BR') {
        this.hasContent = false;
        return;
    }
    
    // Multiple elements mean multiple lines -> has content
    this.hasContent = true;
  }

  private renderContent(text: string, saveCursor: boolean): void {
    if (!this.editable) return;
    
    const el = this.editable.nativeElement;
    
    // 1. Save cursor position (character offset)
    let cursorOffset = 0;
    if (saveCursor) {
        cursorOffset = this.getCaretCharacterOffsetWithin(el);
    }

    // 2. Generate new HTML
    const tokens = this.linkifyService.findLinks(text);
    let newHtml = '';
    
    tokens.forEach(token => {
       if (token.type === 'url') {
         newHtml += `<span class="text-color-link">${this.escapeHtml(token.value)}</span>`;
       } else {
         newHtml += this.escapeHtml(token.value);
       }
    });
    
    // Replace newlines with <br> for HTML rendering
    // IMPORTANT: Append a zero-width space or similar if it ends with <br> to help cursor positioning?
    // Standard contenteditable behavior often needs a <br> at the end for the cursor to sit on a new line.
    newHtml = newHtml.replace(/\n/g, '<br>');

    // If the last token was a newline (or text ends with newline), browser adds an extra <br> sometimes.
    // If we manually set innerHTML ending with <br>, Chrome might not let you put cursor after it unless there's more content.
    
    // Optimization: Don't touch DOM if HTML hasn't changed
    if (newHtml === this.lastHtml) {
        return;
    }
    
    this.lastHtml = newHtml;
    this.renderer.setProperty(el, 'innerHTML', newHtml);

    // 3. Restore cursor position
    if (saveCursor) {
        this.setCaretPosition(el, cursorOffset);
    }
  }

  focus(): void {
    if (this.editable) {
        // Check if we already have focus to avoid recursive loops or unnecessary work
        if (document.activeElement === this.editable.nativeElement) {
            return;
        }
        this.editable.nativeElement.focus();
        // Move cursor to end
        const length = this.editable.nativeElement.innerText.length;
        this.setCaretPosition(this.editable.nativeElement, length);
    }
  }

  private getCaretCharacterOffsetWithin(element: HTMLElement): number {
    let caretOffset = 0;
    const sel = window.getSelection();
    
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      
      if (!element.contains(range.startContainer)) {
          return 0;
      }

      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      const fragment = preCaretRange.cloneContents();
      
      const countChars = (node: Node): number => {
          if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent?.length || 0;
          } else if (node.nodeName === 'BR') {
              return 1;
          } else {
              let count = 0;
              for (let i = 0; i < node.childNodes.length; i++) {
                  count += countChars(node.childNodes[i]);
              }
              return count;
          }
      };
      caretOffset = countChars(fragment);
    }
    return caretOffset;
  }

  private setCaretPosition(element: HTMLElement, offset: number): void {
    let currentOffset = 0;
    const range = document.createRange();
    const sel = window.getSelection();
    
    const traverse = (node: Node): boolean => {
        if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent?.length || 0;
            if (currentOffset + len >= offset) {
                range.setStart(node, offset - currentOffset);
                range.collapse(true);
                return true;
            }
            currentOffset += len;
        } else if (node.nodeName === 'BR') {
            currentOffset += 1;
            if (currentOffset === offset) {
                range.setStartAfter(node);
                range.collapse(true);
                return true;
            }
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (traverse(node.childNodes[i])) return true;
            }
        }
        return false;
    };

    if (traverse(element)) {
        sel?.removeAllRanges();
        sel?.addRange(range);
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
