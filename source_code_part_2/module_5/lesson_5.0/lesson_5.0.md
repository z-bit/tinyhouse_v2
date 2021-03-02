# Module 5 Introduction

In the last module, we helped facilitate the capability for a user to sign-in with a Google account with the help of OAuth 2.0, however, there was a certain problem we noticed by the end of the module. If we were to ever refresh a page in the app when logged-in, our login state was effectively removed. Though a user will just be able to log-in again by going to the Login page and clicking beginning the sign-in process with Google, this will be repetitive. Is there a way we can persist the log-in session of a user?

Yes! We can accomplish this with [**cookies**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies). In this module, we'll:

-   Talk about persistent login sessions and cookies.
-   Compare [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), and [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
-   Utilize a cookie on our client to persist login state.
-   Discuss and see how we can help avoid [cross-site request forgery attacks](https://developer.mozilla.org/en-US/docs/Glossary/CSRF).
