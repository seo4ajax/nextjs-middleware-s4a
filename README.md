# nextjs-middleware-s4a

[SEO4Ajax](https://www.seo4ajax.com) is a service that allows AJAX websites
(e.g. based on Angular, React, Vue.js, Svelte, Backbone, Ember, jQuery etc.) to
be indexable by search engines and social networks.

`nextjs-middleware-s4a` is a middleware that provides an easy way to
proxy bot requests to [SEO4Ajax](https://www.seo4ajax.com) in
[Next.js](https://github.com/vercel/next.js/) applications.

## Installation

Via npm:

```sh
$ npm install nextjs-middleware-s4a
```

## Usage

If you don't have a middleware yet in your project, create the file 
`middleware.ts` (or `.js`) in the root folder. Import the exported function 
from `nextjs-middleware-s4a` in this file. Call the exported function with the 
site token as parameter to get the proxy function. Finally, call the proxy 
function in `middleware()`.

The `middleware.ts` file in your Next.js app should look like this:

```ts
import type { NextRequest } from "next/server";
import s4aMiddleware from "nextjs-middleware-s4a";

const siteToken = "your site token on SEO4Ajax";
const s4aProxy = s4aMiddleware(siteToken);

export function middleware(request: NextRequest) {
  const response = s4aProxy(request);
  // call other middlewares here if needed
  return response;
}

export const config = {
  matcher: [
    /*
    * Match all request paths except for the ones starting with:
    * - api (API routes)
    * - _next/static (static files)
    * - _next/image (image optimization files)
    * - favicon.ico (favicon file)
    */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

The `s4aMiddleware` function requires one mandatory parameter: the token of the
site on SEO4Ajax. The second parameter is optional, it is an object with the
following property:

- `pathPattern`: a regular expression indicating when paths that must be proxied
  to SEO4Ajax (`undefined` by default)

## How it works

This module checks the presence of a user-agent string identifying bots. If a
bot is detected, the module requests the snapshot from api.seo4ajax.com and
returns it. Otherwise the module ignores the request.

## Requirements

- next.js (>= 12)

## License

(The MIT License)

Copyright (c) 2023 Capsule Code

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
