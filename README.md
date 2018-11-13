# normalize-glob

Normalize a glob pattern by expanding braces, making it absolute and resolving parent directories '..'.

## Usage

```ts
import {normalizeGlob} from 'normalize-glob';

// using iteration protocol
for (const pattern of normalizeGlob('../foo/*', process.cwd())) {
    // use 'pattern'
}

// converting the result to an array
Array.from(normalizeGlob('../foo/*', process.cwd()));
```

Note that glob patterns are supposed to use forward slashes as directory separator. The `cwd` parameter may use backslashes as directory separator on windows.
