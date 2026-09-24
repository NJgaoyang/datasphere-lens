import { rendererRegistry } from '../registry/RendererRegistry';
import { registerDefaultRenderers } from '../renderer/registerDefaultRenderers';

describe('default renderer registry', () => {
  beforeEach(() => {
    rendererRegistry.clear();
  });

  test('registers all renderer boundaries', () => {
    registerDefaultRenderers();

    expect(rendererRegistry.has('legacy')).toBe(true);
    expect(rendererRegistry.has('echarts')).toBe(true);
    expect(rendererRegistry.has('table')).toBe(true);
    expect(rendererRegistry.has('s2')).toBe(true);
    expect(rendererRegistry.has('react')).toBe(true);
    expect(rendererRegistry.has('map')).toBe(true);
  });
});
