import { ChevronDown } from "lucide-react";
import { LEARN_CATEGORIES } from "@/lib/learn-content";

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Learn</p>
        <h1 className="mt-1 text-balance font-display text-3xl font-medium">Training, nutrition, and recovery</h1>
        <p className="mt-2 max-w-[65ch] text-muted">
          Research-backed basics on training, eating, sleep, supplements, and the mistakes that
          slow beginners down most — in and out of the gym.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-y border-border py-4">
        {LEARN_CATEGORIES.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {category.title}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-12">
        {LEARN_CATEGORIES.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-6">
            <h2 className="font-display text-2xl font-medium">{category.title}</h2>
            <div className="mt-5 flex flex-col gap-5">
              {category.articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-surface p-6"
                >
                  <h3 className="text-balance font-display text-lg font-medium">{article.title}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {article.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <details className="group mt-4 border-t border-border pt-4">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors duration-200 hover:text-accent [&::-webkit-details-marker]:hidden">
                      <ChevronDown
                        size={14}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-open:rotate-180"
                      />
                      Read the full explanation
                    </summary>
                    <div className="mt-3 flex max-w-[65ch] flex-col gap-3 text-sm leading-relaxed text-muted">
                      {article.body.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-border pt-6 text-xs text-muted">
        This content is general education, not personalized medical or nutrition advice. Talk to a
        doctor before making major changes to your training, diet, or supplement routine — and
        especially before considering any performance-enhancing drug.
      </p>
    </div>
  );
}
