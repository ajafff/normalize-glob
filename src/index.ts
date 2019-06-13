import expandBraces = require('brace-expansion');
import isNegatedGlob = require('is-negated-glob');
import path = require('path');

/**
 * @param input the glob pattern with forward slash as directory separator
 * @param cwd the absolute path of the current directory with forward slash or backslash as directory separator.
 */
export function* normalizeGlob(input: string, cwd: string) {
    if (input === '')
        input = '.';
    for (let pattern of expandBraces(input)) {
        const trailingSlash = pattern.endsWith('/');
        const ing = isNegatedGlob(pattern);
        ({pattern} = ing);
        let {root} = path.parse(pattern);
        let parts;
        if (root) {
            parts = pattern.substr(root.length).split(/[/\\]+/g);
        } else {
            ({root} = path.parse(cwd));
            if (!root)
                throw new Error("'cwd' must be an absolute path");
            parts = [...cwd.substr(root.length).split(/[/\\]+/g), ...pattern.split(/[/\\]+/g)];
        }
        root = root.replace(/\\$/, '/');
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
                    if (i === parts.length - 1)
                        trailingSlash = true;
                    yield* appendPath(result.slice(0, -1), parts, i + 1, prefix, trailingSlash);
                    result.push('**');
                }
                break;
            case '**':
                // collapse multiple globstars into one
                if (result[result.length - 1] === '**')
                    break;
                // falls through
            default:
                result.push(parts[i]);
        }
    }
    const joined = join(prefix, result.join('/'));
    yield trailingSlash ? ensureTrailingSlash(joined) : joined;
}

function join(prefix: string, suffix: string) {
    if (!suffix)
        return prefix;
    return ensureTrailingSlash(prefix) + suffix;
}

function ensureTrailingSlash(p: string) {
    return p.endsWith('/') ? p : p + '/';
}
