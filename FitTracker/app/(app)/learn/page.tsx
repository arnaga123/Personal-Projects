import { LEARN_CATEGORIES } from "@/lib/learn-content";

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Learn</p>
        <h1 className="mt-1 font-display text-3xl font-medium">Training, nutrition, and recovery</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Research-backed basics on training, eating, sleep, supplements, and the mistakes that
          slow beginners down most — in and out of the gym.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-y border-border py-4">
        {LEARN_CATEGORIES.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-foreground"
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
                <article key={article.id} className="border border-border bg-surface p-6">
                  <h3 className="font-display text-lg font-medium">{article.title}</h3>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
                    {article.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
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
