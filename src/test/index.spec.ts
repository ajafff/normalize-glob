import test from 'ava';
import { normalizeGlob } from '..';

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
});

test('ignores cwd if glob is absolute', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/foo', '/bar')), ['/foo']);
    t.deepEqual(Array.from(normalizeGlob('/foo', 'bar')), ['/foo']);
});

test('throws if glob and cwd are not absolute', (t) => {
    t.throws(() => Array.from(normalizeGlob('foo', 'bar')));
});
