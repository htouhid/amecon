import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { supabase } from './supabase';

interface HonourBoardProduct {
  code: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-honour-board-detail',
  imports: [RouterLink],
  templateUrl: './honour-board-detail.html',
})
export class HonourBoardDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private requestId = 0;
  readonly product = signal<HonourBoardProduct | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly photoMissing = signal(false);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.loadProduct();
    });
  }

  async loadProduct(): Promise<void> {
    const requestId = ++this.requestId;
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loading.set(true);
    this.error.set('');
    this.product.set(null);
    this.photoMissing.set(false);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('code, name, slug')
        .eq('category', 'honour-boards')
        .eq('slug', slug)
        .maybeSingle();
      if (requestId !== this.requestId) return;
      if (error) throw error;
      this.product.set(data);
      this.title.setTitle(data ? `${data.name} | AMECON` : 'Product not found | AMECON');
    } catch {
      if (requestId !== this.requestId) return;
      this.error.set('We couldn’t load this Honour Board. Please try again or contact our showroom.');
    } finally {
      if (requestId === this.requestId) this.loading.set(false);
    }
  }

  photoUrl(product: HonourBoardProduct): string {
    return `/images/products/${encodeURIComponent(product.code.toLowerCase())}.webp`;
  }

  quoteUrl(product: HonourBoardProduct): string {
    return `https://wa.me/8801715090328?text=${encodeURIComponent(
      `Hello AMECON, I would like to request a quote for ${product.name}, code ${product.code}.`,
    )}`;
  }
}
