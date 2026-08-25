import { detectIntent } from './intent.js';

export function processCommand(command) {
    const intent = detectIntent(command);

    return {
        command,
        intent
    };
}
