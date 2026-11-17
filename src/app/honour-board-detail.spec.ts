import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from './app.routes';
import { supabase } from './supabase';

const product = { code: 'hb0037', name: 'Wooden Honour Board', slug: 'wooden-honour-board' };
const detailUrl = '/collections/honour-boards/wooden-honour-board';

describe('Honour Board detail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  function mockQuery(result: unknown) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const order = vi.fn().mockResolvedValue({ data: [product], error: null });
    const eq = vi.fn();
    eq.mockReturnValue({ eq, maybeSingle, order });
    const select = vi.fn().mockReturnValue({ eq });
    vi.spyOn(supabase, 'from').mockReturnValue({ select } as never);
    return { select, eq, maybeSingle };
  }

  it('navigates from the catalog to the slug detail and back', async () => {
    const query = mockQuery({ data: product, error: null });
    const harness = await RouterTestingHarness.create('/collections/honour-boards');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const link = harness.routeNativeElement?.querySelector('h2 a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(detailUrl);
    link.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe(detailUrl);
    expect(query.eq).toHaveBeenCalledWith('category', 'honour-boards');
    expect(query.eq).toHaveBeenCalledWith('slug', 'wooden-honour-board');
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toBe(product.name);
    expect(page.textContent).toContain(product.code);
    const quote = page.querySelector('.actions a') as HTMLAnchorElement;
    expect(quote.href).toContain('https://wa.me/8801715090328?text=');
    expect(decodeURIComponent(quote.href)).toContain('Wooden Honour Board, code hb0037');
    const image = page.querySelector('img')!;
    expect(image.getAttribute('src')).toBe('/images/products/hb0037.webp');
    image.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(page.querySelector('img')).toBeNull();
    expect(page.textContent).toContain('Product photo coming soon');
    (page.querySelector('.back-link') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/collections/honour-boards');
  });

  it('shows a not-found state for an unknown slug', async () => {
    mockQuery({ data: null, error: null });
    const harness = await RouterTestingHarness.create('/collections/honour-boards/unknown');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Product not found');
  });

  it('shows query errors and retries successfully', async () => {
    const query = mockQuery({ data: null, error: { message: 'Unavailable' } });
    const harness = await RouterTestingHarness.create(detailUrl);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')).toBeTruthy();
    query.maybeSingle.mockResolvedValue({ data: product, error: null });
    (harness.routeNativeElement?.querySelector('button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Loading product');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(product.name);
  });
});
