import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function expectNoA11yViolations(
  page: Page,
  label: string,
  options: { include?: string; exclude?: string[] } = {},
): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude?.length) builder = builder.exclude(options.exclude);

  const { violations } = await builder.analyze();
  const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 3)
          .map((n) => `      target: ${n.target.join(' ')}\n      html: ${n.html.slice(0, 200)}`)
          .join('\n');
        return `  - [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
      })
      .join('\n');
    throw new Error(`A11y violations on "${label}":\n${summary}`);
  }

  expect(blocking, `No critical/serious axe violations on "${label}"`).toHaveLength(0);
}
