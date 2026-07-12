import { ArrowRight, ChevronLeft, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HtmlFragment from "./HtmlFragment";
import { getBlogPostBySlug, type BlogPost } from "../blog";

interface BlogPostListItem {
  title: string;
  date: string;
  author: string;
  slug: string;
  summary: string;
  tags: string[];
}

function formatPostDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogTags({ tags }: Pick<BlogPost, "tags">) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-text-muted">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-border bg-background px-3 py-1 font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/blog");
        if (!response.ok) {
          throw new Error(`Blog endpoint failed with ${response.status}.`);
        }

        const payload = await response.json() as { posts?: BlogPostListItem[] };
        if (!isActive) {
          return;
        }

        setPosts(Array.isArray(payload.posts) ? payload.posts : []);
        setHasError(false);
      } catch {
        if (!isActive) {
          return;
        }

        setHasError(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-4 lg:py-0 space-y-6">
      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Blog
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-muted sm:text-lg">
          Product notes, planning tips, and country-aware vacation ideas. This
          first entry is a plain HTML sample we can use as a design and content
          quality gate before adding markdown generation.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-text-muted">Loading posts...</p>
      )}

      {hasError && (
        <p className="text-sm text-text-muted">
          Blog posts could not be loaded right now.
        </p>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.slug} className="content-panel">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span aria-hidden="true">•</span>
              <span>{post.author}</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-text">
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
                {post.summary}
              </p>
            </div>
            <BlogTags tags={post.tags} />
            <div className="flex justify-end">
              <Link
                to={`/blog/${post.slug}`}
                className="action-btn action-btn-primary"
              >
                Read more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BlogSamplePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : null;
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    if (!post) {
      return;
    }

    document.title = `${post.title} | Vacation Optimizer`;

    const descriptionTag = document.querySelector('meta[name="description"]');
    descriptionTag?.setAttribute("content", post.summary);

    const canonicalTag = document.querySelector('link[rel="canonical"]');
    canonicalTag?.setAttribute("href", `${window.location.origin}/blog/${post.slug}`);
  }, [post]);

  if (!post) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-4 lg:py-0 space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link to="/blog" className="action-btn action-btn-secondary">
            <ChevronLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-text">Post not found</h1>
          <p className="text-base leading-7 text-text-muted">
            The requested blog post could not be found.
          </p>
        </div>
      </section>
    );
  }

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: shareUrl,
        });
        setShareStatus("shared");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("idle");
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-4 lg:py-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/blog"
          className="action-btn action-btn-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <div className="flex items-center gap-3">
          {shareStatus !== "idle" && (
            <span className="text-sm text-text-muted">
              {shareStatus === "copied" ? "Link copied" : "Share sheet opened"}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              void handleShare();
            }}
            className="action-btn action-btn-secondary"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">•</span>
          <span>{post.author}</span>
        </div>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {post.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-muted sm:text-lg">
            {post.summary}
          </p>
        </div>
        <BlogTags tags={post.tags} />
      </header>
      <HtmlFragment
        html={post.html}
        className="blog-post-content space-y-8 text-[15px] leading-7 text-text-muted sm:text-base"
      />
    </section>
  );
}
