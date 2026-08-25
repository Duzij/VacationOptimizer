import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlogListPage, BlogSamplePostPage } from "./BlogPages";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

vi.mock("../blog", () => ({
  getAllBlogPosts: () => [
    {
      title: "Maximize Your Vacation in the US in 2027",
      date: "2026-07-05",
      author: "Team",
      slug: "maximize-your-vacation-in-the-us-in-2027",
      summary: "Stretch limited PTO around US federal holidays in 2027.",
      tags: ["us", "pto"],
      html: "<h2>Bridge days</h2><p>Take Friday off after Thanksgiving.</p>",
    },
  ],
  getBlogPostBySlug: (slug: string) => (
    slug === "maximize-your-vacation-in-the-us-in-2027"
      ? {
        title: "Maximize Your Vacation in the US in 2027",
        date: "2026-07-05",
        author: "Team",
        slug: "maximize-your-vacation-in-the-us-in-2027",
        summary: "Stretch limited PTO around US federal holidays in 2027.",
        tags: ["us", "pto"],
        html: "<h2>Bridge days</h2><p>Take Friday off after Thanksgiving.</p>",
      }
      : null
  ),
}));

describe("Blog pages", () => {
  it("renders the blog list from the blog endpoint", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        posts: [
          {
            title: "Maximize Your Vacation in the US in 2027",
            date: "2026-07-05",
            author: "Team",
            slug: "maximize-your-vacation-in-the-us-in-2027",
            summary: "Stretch limited PTO around US federal holidays in 2027.",
            tags: ["us", "pto"],
          },
        ],
      }),
    } as Response);

    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Maximize Your Vacation in the US in 2027")).toBeTruthy();
    expect(screen.getByText("Stretch limited PTO around US federal holidays in 2027.")).toBeTruthy();
    expect(window.fetch).toHaveBeenCalledWith("/api/blog");
    expect(screen.getByRole("link", { name: /Read more/i }).getAttribute("href"))
      .toBe("/blog/maximize-your-vacation-in-the-us-in-2027/");
  });

  it("renders the blog detail for a slug route", () => {
    document.head.innerHTML = `
      <meta name="description" content="" />
      <link rel="canonical" href="" />
    `;

    render(
      <MemoryRouter initialEntries={["/blog/maximize-your-vacation-in-the-us-in-2027/"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogSamplePostPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Maximize Your Vacation in the US in 2027" })).toBeTruthy();
    expect(screen.getByText("Bridge days")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Share/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Back to blog/i }).getAttribute("href")).toBe("/blog/");
  });

  it("updates document metadata from the resolved post", () => {
    document.title = "";
    document.head.innerHTML = `
      <meta name="description" content="" />
      <link rel="canonical" href="" />
    `;
    window.history.replaceState({}, "", "/blog/maximize-your-vacation-in-the-us-in-2027/");

    render(
      <MemoryRouter initialEntries={["/blog/maximize-your-vacation-in-the-us-in-2027/"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogSamplePostPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(document.title).toBe("Maximize Your Vacation in the US in 2027 | Vacation Optimizer");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content"))
      .toBe("Stretch limited PTO around US federal holidays in 2027.");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe("http://localhost:3000/blog/maximize-your-vacation-in-the-us-in-2027/");
  });
});
