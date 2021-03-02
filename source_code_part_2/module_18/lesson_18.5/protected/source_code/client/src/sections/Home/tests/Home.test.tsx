import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/react-testing";
import { Home } from "../index";

describe("Home", () => {
  // remove console error with window.scrollTo
  window.scrollTo = () => {};

  describe("search input", () => {
    it("renders an empty search input on initial render", async () => {
      const history = createMemoryHistory();
      const { getByPlaceholderText } = render(
        <MockedProvider mocks={[]}>
          <Router history={history}>
            <Home />
          </Router>
        </MockedProvider>
      );

      await waitFor(() => {
        const searchInput = getByPlaceholderText(
          "Search 'San Fransisco'"
        ) as HTMLInputElement;

        expect(searchInput.value).toEqual("");
      });
    });
  });

  // describe("premium listings", () => {

  // });
});
