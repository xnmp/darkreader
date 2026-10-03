import Messenger, {type ExtensionAdapter} from '../../../src/background/messenger';
import {MessageTypeUItoBG} from '../../../src/utils/message';


describe('Background request readiness', () => {
    it('keeps the developer-fixes response channel open until startup completes', async () => {
        let listener: (...args: any[]) => boolean | undefined;
        const origin = 'chrome-extension://test';
        Object.defineProperty(globalThis, 'chrome', {
            configurable: true,
            value: {runtime: {
                getURL: (path: string) => `${origin}${path}`,
                onMessage: {addListener: (callback: typeof listener) => listener = callback},
            }},
        });
        let ready: () => void;
        const startup = new Promise<void>((resolve) => ready = resolve);
        const applyDevFixes = jest.fn(() => null);
        Messenger.init({waitUntilReady: () => startup, applyDevFixes} as unknown as ExtensionAdapter);
        const sendResponse = jest.fn();

        const keepChannelOpen = listener!({
            type: MessageTypeUItoBG.APPLY_DEV_FIXES,
            data: {type: 'dynamic', text: 'example.com'},
        }, {url: `${origin}/ui/devtools/index.html`}, sendResponse);

        expect(keepChannelOpen).toBe(true);
        expect(applyDevFixes).not.toHaveBeenCalled();
        expect(sendResponse).not.toHaveBeenCalled();
        ready!();
        await startup;
        expect(applyDevFixes).toHaveBeenCalledWith('dynamic', 'example.com');
        expect(sendResponse).toHaveBeenCalledWith({error: undefined});
    });
});
