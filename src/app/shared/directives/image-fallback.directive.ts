import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {

  @Input() appImageFallback: string = 'https://picsum.photos/300/180?random=1';

  constructor(private elementRef: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    const img = this.elementRef.nativeElement;
    if (img.src !== this.appImageFallback) {
      img.src = this.appImageFallback;
    }
  }
}
