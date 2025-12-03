import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LinkifyService } from '../utils/linkify.service';

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  constructor(
    private linkifyService: LinkifyService,
    private sanitizer: DomSanitizer
  ) {}

  transform(value: string): SafeHtml {
    if (!value) return value;
    const linkedText = this.linkifyService.linkify(value, 'text-color-link hover:underline break-words');
    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}

