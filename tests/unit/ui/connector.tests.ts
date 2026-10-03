import Connector from '../../../src/ui/connect/connector';


describe('Popup requests to the background worker', () => {
    afterEach(() => jest.restoreAllMocks());

    function respond(response: unknown, lastError?: {message: string}) {
        Object.defineProperty(globalThis, 'chrome', {
            configurable: true,
            value: {
                runtime: {
                    lastError,
                    sendMessage: (_message: unknown, callback: (response: unknown) => void) => callback(response),
                },
            },
        });
    }

    it('returns settings from a successful response', async () => {
        const data = {isReady: true, settings: {theme: {mode: 0}}};
        respond({data});
        await expect(new Connector().getData()).resolves.toEqual(data);
    });

    it('rejects a missing receiver without throwing from the callback', async () => {
        respond(undefined, {message: 'Could not establish connection. Receiving end does not exist.'});
        await expect(new Connector().getData()).rejects.toThrow('Receiving end does not exist');
    });

    it.each([undefined, null])('rejects an absent response: %p', async (response) => {
        respond(response);
        await expect(new Connector().getData()).rejects.toThrow('returned no response');
    });

    it('preserves errors returned by the background worker', async () => {
        respond({error: 'Settings could not be loaded'});
        await expect(new Connector().getData()).rejects.toBe('Settings could not be loaded');
    });
});
