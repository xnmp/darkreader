import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

import {isDesktopThemeSettings} from '../../../src/background/desktop-theme-bridge';


describe('Desktop theme bridge settings validation', () => {
    test.each([
        null,
        [],
        {},
        {theme: null},
        {theme: []},
        {enabled: 'yes', theme: {}},
    ])('rejects malformed settings: %p', (settings) => {
        expect(isDesktopThemeSettings(settings)).toBe(false);
    });

    test.each([
        {theme: {}},
        {enabled: true, theme: {mode: 1}},
        {enabled: false, theme: {mode: 0}},
    ])('accepts theme settings: %p', (settings) => {
        expect(isDesktopThemeSettings(settings)).toBe(true);
    });
});

describe('Desktop theme bridge manifest', () => {
    it('uses a distinct four-part Chrome version for reliable unpacked updates', async () => {
        const path = join(__dirname, '../../../src/manifest-chrome-mv3.json');
        const manifest: chrome.runtime.Manifest = JSON.parse(await readFile(path, {encoding: 'utf-8'}));

        expect(manifest.version).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
        expect(manifest.version_name).toContain('desktop-theme-bridge');
    });
});
