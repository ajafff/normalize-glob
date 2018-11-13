import expandBraces = require('brace-expansion');
import isNegatedGlob = require('is-negated-glob');
import path = require('path');

/**
 * @param input the glob pattern with forward slash as directory separator
 * @param cwd the absolute path of the current directory with forward slash or backslash as directory separator.
 */
export function* normalizeGlob(input: string, cwd: string) {
    for (let pattern of expandBraces(input)) {
        const trailingSlash = pattern.endsWith('/');
        const ing = isNegatedGlob(pattern);
        pattern = ing.pattern;
        let {root} = path.parse(pattern);
        let parts;
        if (root) {
            parts = pattern.substr(root.length).split(/\/+/g);
            if (root.endsWith('/'))
                root = root.slice(0, -1);
        } else {
            ({root} = path.parse(cwd));
            parts = [...cwd.substr(root.length).split(/[/\\]+/g), ...pattern.split(/\/+/g)];
            if (/[/\\]$/.test(root))
                root = root.slice(0, -1);
        }
        if (ing.negated)
            root = '!' + root;
        yield* appendPath([], parts, 0, root, trailingSlash);
    }
}

function* appendPath(result: string[], parts: string[], i: number, prefix: string, trailingSlash: boolean): IterableIterator<string> {
    for (; i < parts.length; ++i) {
        switch (parts[i]) {
            case '':
            case '.':
                break;
            case '..':
                if (result.pop() === '**') {
                    yield* appendPath(result.slice(), parts, i + 1, prefix, trailingSlash);
                    result.push('**');
                }
                break;
            default:
                result.push(parts[i]);
        }
    }
    result.unshift(prefix);
    if (trailingSlash)
        result.push('');
    yield result.join('/');
}