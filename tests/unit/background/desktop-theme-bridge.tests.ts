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
