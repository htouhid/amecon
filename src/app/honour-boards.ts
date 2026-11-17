import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { supabase } from './supabase';

interface HonourBoard {
  code: string;
  name: string;
  slug: string | null;
}

@Component({
  selector: 'app-honour-boards',
  imports: [RouterLink],
  templateUrl: './honour-boards.html',
})
export class HonourBoards implements OnInit {
  readonly products = signal<HonourBoard[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    void this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('code, name, slug')
        .eq('category', 'honour-boards')
        .order('code');
      if (error) throw error;
      this.products.set(data ?? []);
    } catch {
      this.error.set('We couldn’t load the Honour Boards. Please try again or contact our showroom.');
    } finally {
      this.loading.set(false);
    }
  }

  quoteUrl(product: HonourBoard): string {
    const reference = product.slug ? ` (${product.slug})` : '';
    return `https://wa.me/8801715090328?text=${encodeURIComponent(
      `Hello AMECON, I would like a quote for ${product.name}, code ${product.code}${reference}.`,
    )}`;
  }
}
