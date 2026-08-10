import type {Theme, UserSettings} from '../definitions';


const NATIVE_HOST = 'com.chong.darkreader_theme';
const RETRY_DELAY_MS = 5000;

export type DesktopThemeSettings = {
    enabled?: boolean;
    theme: Theme;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function isDesktopThemeSettings(value: unknown): value is DesktopThemeSettings {
    if (!isObject(value) || !isObject(value.theme)) {
        return false;
    }
    return value.enabled == null || typeof value.enabled === 'boolean';
}

export function connectDesktopThemeHost(
    extensionStarted: Promise<void>,
    applySettings: (settings: Partial<UserSettings>) => Promise<void>,
): () => void {
    let port: chrome.runtime.Port | null = null;
    let retryId: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const retry = () => {
        if (!stopped) {
            retryId = setTimeout(connect, RETRY_DELAY_MS);
        }
    };

    const connect = () => {
        retryId = null;
        try {
            port = chrome.runtime.connectNative(NATIVE_HOST);
        } catch (error) {
            console.warn('Dark Reader desktop theme bridge:', error);
            retry();
            return;
        }

        port.onMessage.addListener(async (settings: unknown) => {
            if (!isDesktopThemeSettings(settings)) {
                console.warn('Dark Reader desktop theme bridge: invalid settings');
                return;
            }
            try {
                await extensionStarted;
                await applySettings(settings);
            } catch (error) {
                console.warn('Dark Reader desktop theme bridge:', error);
            }
        });
        port.onDisconnect.addListener(() => {
            const error = chrome.runtime.lastError;
            if (error) {
                console.warn('Dark Reader desktop theme bridge:', error.message);
            }
            port = null;
            retry();
        });
    };

    connect();
    return () => {
        stopped = true;
        if (retryId != null) {
            clearTimeout(retryId);
        }
        port?.disconnect();
        port = null;
    };
}
