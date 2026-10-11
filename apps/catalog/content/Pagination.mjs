import {createElement as h} from "react";
import {Pagination} from "../../../packages/react/dist/index.js";

const wide = {width: "100%", maxWidth: "36rem"};

export default {
  description:
    "Pagination moves between the pages of a list: the page numbers, with ellipses when there are " +
    "many, previous and next. The current page has Aurea's light highlight. With href, every page " +
    "is a real link a search engine can follow.",

  install: 'import {Pagination} from "@aurea-uds/react";',

  features: [
    "Numbers by default: the first, the last, the current one and one on each side (siblings).",
    "summary puts a line on the left — \"1 to 5 of 50 orders\".",
    "href turns each page into a link (<a href>), with aria-current on the current one.",
    "variant=\"simple\" keeps only previous and next; variant=\"compact\" is the look up to 0.31.0.",
    "Each number is named \"Page 3\" for screen readers.",
    "label names the navigation landmark: with two paginations on one page, each says what it pages through.",
  ],

  examples: [
    {
      title: "Numbers",
      description: "The current page in the light highlight; the gap becomes an ellipsis.",
      code: '<Pagination label="Search results" page={page} total={12} onPageChange={setPage} />',
      render: () => h(Pagination, {label: "Search results", page: 5, total: 12, onPageChange: () => {}}),
    },
    {
      title: "With a summary",
      description: "The line on the left says what the pages hold.",
      code: '<Pagination label="Orders" page={1} total={10} summary="1 to 5 of 50 orders" onPageChange={setPage} />',
      render: () => h("div", {style: wide}, h(Pagination, {label: "Orders", page: 1, total: 10, summary: "1 to 5 of 50 orders", onPageChange: () => {}})),
    },
    {
      title: "Simple",
      description: "Only previous and next — for an article split into parts.",
      code: '<Pagination variant="simple" label="Article parts" page={2} total={4} onPageChange={setPage} />',
      render: () => h(Pagination, {variant: "simple", label: "Article parts", page: 2, total: 4, onPageChange: () => {}}),
    },
    {
      title: "Links",
      description: "With href each page is a real link, which a search engine follows and a person can open in a new tab.",
      code: '<Pagination label="Blog posts" page={2} total={6} href={(p) => `/blog?page=${p}`} />',
      render: () => h(Pagination, {label: "Blog posts", page: 2, total: 6, href: (p) => `#page-${p}`}),
    },
    {
      title: "Compact",
      description: "The look up to 0.31.0, for a tight toolbar.",
      code: '<Pagination variant="compact" label="Log entries" page={3} total={12} onPageChange={setPage} />',
      render: () => h(Pagination, {variant: "compact", label: "Log entries", page: 3, total: 12, onPageChange: () => {}}),
    },
  ],
};
