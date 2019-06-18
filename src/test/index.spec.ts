import test from 'ava';
import { normalizeGlob } from '..';
import { platform } from 'os';

test('expands curly braces', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/{foo,bar}/{baz/,bas}', '/')), ['/foo/baz/', '/foo/bas', '/bar/baz/', '/bar/bas']);
});

test('resolves individual globs', (t) => {
    t.deepEqual(Array.from(normalizeGlob('{/foo,bar}', '/baz')), ['/foo', '/baz/bar']);
    t.deepEqual(Array.from(normalizeGlob('{/foo,bar}', '/')), ['/foo', '/bar']);
});

test('resolves . and ..', (t) => {
    t.deepEqual(Array.from(normalizeGlob('..', '/baz/bar')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('../..', '/baz/bar')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('../../..', '/baz/bar')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/..', '/')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/../..', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/../../..', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('.', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('.', '/baz')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('./', '/baz')), ['/baz/']);
    t.deepEqual(Array.from(normalizeGlob('', '/baz')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('/foo/*/..', '/')), ['/foo']);
    t.deepEqual(Array.from(normalizeGlob('/foo/./..', '/')), ['/']);

    t.deepEqual(Array.from(normalizeGlob('/foo/bar/**/..', '/')), ['/foo/', '/foo/bar/**/']);
    t.deepEqual(Array.from(normalizeGlob('/foo/bar/**/../baz', '/')), ['/foo/baz', '/foo/bar/**/baz']);
    t.deepEqual(Array.from(normalizeGlob('/foo/bar/**/**/..', '/')), ['/foo/', '/foo/bar/**/']);
});

test('preserves negation', (t) => {
    t.deepEqual(Array.from(normalizeGlob('!foo', '/bar')), ['!/bar/foo']);
    t.deepEqual(Array.from(normalizeGlob('!/foo', '/bar')), ['!/foo']);
    t.deepEqual(Array.from(normalizeGlob('{!foo,/baz,!/bas}', '/bar')), ['!/bar/foo', '/baz', '!/bas']);
});

test('collapses globstars', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/foo/**/**', '/')), ['/foo/**']);
    t.deepEqual(Array.from(normalizeGlob('/foo/**/*', '/')), ['/foo/**/*']);
    t.deepEqual(Array.from(normalizeGlob('/foo/*/**', '/')), ['/foo/*/**']);
    t.deepEqual(Array.from(normalizeGlob('/**/**', '/')), ['/**']);
    t.deepEqual(Array.from(normalizeGlob('/foo/**/../**', '/')), ['/**', '/foo/**']);
});

test('ignores cwd if glob is absolute', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/foo', '/bar')), ['/foo']);
    t.deepEqual(Array.from(normalizeGlob('/foo', 'bar')), ['/foo']);
});

test('throws if glob and cwd are not absolute', (t) => {
    t.throws(() => Array.from(normalizeGlob('foo', 'bar')));
});

if (platform() === 'win32') {
    test('handles windows paths', (t) => {
        t.deepEqual(Array.from(normalizeGlob('C:', 'C:\\')), ['C:']);
        t.deepEqual(Array.from(normalizeGlob('C:/', 'C:\\')), ['C:/']);
        t.deepEqual(Array.from(normalizeGlob('C:\\', 'C:\\')), ['C:\\']);
        t.deepEqual(Array.from(normalizeGlob('', 'C:\\')), ['C:/']);
        t.deepEqual(Array.from(normalizeGlob('', 'C:')), ['C:/']);
        t.deepEqual(Array.from(normalizeGlob('./', 'C:')), ['C:/']);
        t.deepEqual(Array.from(normalizeGlob('foo', 'C:')), ['C:/foo']);
        t.deepEqual(Array.from(normalizeGlob('C:\\foo\\bar', 'C:\\')), ['C:\\foo\\bar']);
        t.deepEqual(Array.from(normalizeGlob('foo\\bar', 'C:/baz')), ['C:/baz/foo\\bar']);
    });

    test("doesn't treat escapes as directory separator", (t) => {
        t.deepEqual(Array.from(normalizeGlob('foo\\*/..', 'C:\\')), ['C:/']);
        t.deepEqual(Array.from(normalizeGlob('bar\\**', 'C:\\foo')), ['C:/foo/bar\\**']);
    });
}
