---
title: Unit Testing
description: In this lesson, we introduce the concept and benefits of unit testing in web applications.
privateVideoUrl: https://fullstack.wistia.com/medias/c87jqax13e
---

# Unit Testing

Though we've yet to address testing in this course, **the importance of testing in front end web development can't be stressed enough**.

Testing can help reveal bugs before they appear, instill confidence in your web application, and make it easy to onboard new developers on an existing codebase. As an upfront investment, **testing often pays dividends over the lifetime of a system**.

## End-to-end vs. Unit Testing

Application testing is often broken down into two main buckets: _end-to-end testing_ or _unit testing_.

### End-to-End Testing

**End-to-end testing** is a top-down approach where tests are written to determine whether an application has been built appropriately from start to finish. We write end-to-end tests as though we are a user's movement through our application.

End-to-end tests are often labeled as integration tests since multiple modules or parts of a software system are often tested together.

### Unit Testing

**Unit testing** is a confined approach that involves isolating each part of an application and testing it in isolation. Tests are provided a given input and an output is often evaluated to make sure it matches expectations.

**In this module, we'll be focusing solely on unit testing on the client side**.

## Testing a mock Calculator

Assume we wanted to test a `Calculator` object performs all the expected arithmetic actions we expect from a calculator.

```js
new Calculator();

// 2 + 2 we expect 4
// 5 - 3 we expect 2
// 4 * 4 we expect 16
```

With existing/popular testing frameworks in JavaScript, our test structure can look something like the following:

```js
describe("Calculator", () => {
  it("sums 2 and 2 to 4", () => {
    // ...
  });

  it("subtracts 5 and 3 to 2", () => {
    // ...
  });
});
```

In the above, we can see the use of `describe()` and `it()` blocks. These often come from the JavaScript testing framework being used and are as follows:

- `describe()` functions segment each logical _unit_ of tests.
- `it()` functions test each _expectation_ we'd want to assert.

Our `Calculator()` object is simple enough for us to use one `describe()` block for the whole class and one `it()` block for each method. With more complex methods that produce different outcomes, it's often suitable to have nested `describe()` functions: one for the object and one for each method. For example:

```js
describe("Calculator", () => {
  describe("sum()", () => {
    it("sums 2 and 2 to 4", () => {
      // ...
    });
  });

  describe("subtract()", () => {
    it("subtracts 5 and 3 to 2", () => {
      // ...
    });
  });
});
```

If we were to take the simpler set-up as above, our tests and the assertions in our test can perhaps look like something like the following.

```js
describe("Calculator", () => {
  it("sums 2 and 2 to 4", () => {
    const calc = new Calculator();
    expect(calc.sum(2, 2)).toEqual(4);
  });

  it("subtracts 5 and 3 to 2", () => {
    const calc = new Calculator();
    expect(calc.subtract(5, 3)).toEqual(2);
  });
});
```

In the first test, we're expecting that `sum(2,2)` from the calculator instance will return a value of `4`. In the second test, we expect that `subtract(5, 3)` to equal `2`.

The `expect()` assertion function and corresponding `toEqual()` helper method comes from the assertion library being used (this can be part of the testing framework or installed as a separate library). The `expect()` assertion helps employ a behaviour-driven approach to writing tests (e.g. _we expect the subtract method to give a result equal to..._).

### Arrange, Act, Assert (AAA) Pattern

A great pattern to think about when it comes to preparing a unit test is the **Arrange, Act, Assert** pattern. Within every test, there will be a beginning stage where the test needs to be arranged. With the calculator instance example above, this would be instantiating the calculator instance.

```js
const calc = new Calculator();
```

Once the test has been arranged, we need to perform the **act** needed in the test. If we're testing the functionality of a `sum()` function, we'll need to run this function in our test.

```js
const sumResult = calc.sum(2, 2);
```

Lastly, the final step of a test will involve how we **assert** what we're looking for.

```js
expect(sumResult).toEqual(4);
```

Altogether, this will look something like the following:

```js
describe("Calculator", () => {
  it("sums 2 and 2 to 4", () => {
    const calc = new Calculator(); // Arrange

    const sumResult = calc.sum(2, 2); // Act

    expect(sumResult).toEqual(4); // Assert
  });
});
```

Regardless of how complicated unit tests become, the **Arrange, Act, Assert** pattern is a helpful reminder to keep in mind in how to structure tests in a robust manner.
