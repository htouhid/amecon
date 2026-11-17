import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { HonourBoards } from './honour-boards';
import { supabase } from './supabase';

describe('HonourBoards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    TestBed.configureTestingModule({ imports: [HonourBoards], providers: [provideRouter([])] });
  });

  function mockQuery(result: unknown) {
    const order = vi.fn().mockResolvedValue(result);
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    vi.spyOn(supabase, 'from').mockReturnValue({ select } as never);
    return { select, eq };
  }

  it('shows loading then renders the filtered product and quote link', async () => {
    const query = mockQuery({ data: [{ code: 'hb0037', name: 'Wooden Honour Board', slug: 'wooden-honour-board' }], error: null });
    const fixture = TestBed.createComponent(HonourBoards);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading Honour Boards');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(query.select).toHaveBeenCalledWith('code, name, slug');
    expect(query.eq).toHaveBeenCalledWith('category', 'honour-boards');
    expect(fixture.nativeElement.textContent).toContain('hb0037');
    expect(fixture.nativeElement.textContent).toContain('Wooden Honour Board');
    expect(decodeURIComponent(fixture.nativeElement.querySelector('.product-grid a').href)).toContain('wooden-honour-board');
  });

  it('shows an empty catalog message', async () => {
    mockQuery({ data: [], error: null });
    const fixture = TestBed.createComponent(HonourBoards);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No Honour Boards are listed yet');
  });

  it('shows query errors and allows retrying', async () => {
    mockQuery({ data: null, error: { message: 'Unavailable' } });
    const fixture = TestBed.createComponent(HonourBoards);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    mockQuery({ data: [], error: null });
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No Honour Boards are listed yet');
  });
});
