<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 5 | Persist Login Sessions with Cookies

#### 1. Data stored in `localStorage` and `sessionStorage` can be sent to the server with every HTTP request.

**A**: True
**B**: False

**Answer**: A - True. Data stored in `localStorage` and `sessionStorage` **can** be sent to the server with every HTTP request. They're **not automatically sent to the server** like with cookies.

#### 2. Cookies with the `HttpOnly` flag are not accessible through client-side JavaScript.

**A**: True
**B**: False

**Answer**: A - True. With the `HttpOnly` flag, we ensure that a cookie can _only_ be accessed from the server and can't be tampered with by JavaScript running on the browser.

#### 3. Cookies with the `Secure` flag are immune to CSRF attacks for all web browsers (old and new).

**A**: True
**B**: False

**Answer**: B - False. At least for now. The `sameSite` flag is [supported by most major browsers](https://caniuse.com/#feat=same-site-cookie-attribute). However, as of now, not all web browsers support this technology. In the meantime, a good strategy to counter CSRF is to also include a token (e.g. `X-CSRF-TOKEN`) with every HTTP request.

#### 4. Which of the following best describes what `sessionStorage` is in context of web browsers.

**A**: Data that is persistent in browser memory, only accessible through client-side JavaScript, and is not automatically sent to the server during an HTTP request.
**B**: Data that is only accessible through client-side JavaScript, is not automatically sent to the server during an HTTP request, and is deleted/removed when a browser tab or window is closed.
**C**: Data that is persistent in browser memory, inaccessible with client-side JavaScript under certain conditions, and is automatically sent to the server during an HTTP request.
**D**: None of the above.

**Answer**: B - Data that is only accessible through client-side JavaScript, is not automatically sent to the server during an HTTP request, and is deleted/removed when a browser tab or window is closed.

#### 5. We've enabled persistent log-in sessions in our app with the help of cookies and by firing a `logIn` request from the client to the server whenever our app first renders.

**A**: True
**B**: False

**Answer**: A - True.
