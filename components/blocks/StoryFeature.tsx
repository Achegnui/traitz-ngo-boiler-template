import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/Media";
import { Container, Section } from "@/components/ui/Section";
import { btnRow, monoLabel } from "@/components/ui/typography";
import { getStory } from "@/lib/data";
import { localize } from "@/lib/i18n";
import type { StoryFeatureBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export async function StoryFeature({ block, locale }: BlockProps<StoryFeatureBlock>) {
  const story = await getStory(block.storyRef);
  if (!story) return null;
  return (
    <Section>
      <Container>
        <Reveal>
          <div className="grain relative grid grid-cols-2 overflow-hidden rounded-2xl bg-brand-anchor text-white max-[860px]:grid-cols-1">
            <Media image={story.coverImage} locale={locale} sizes="(max-width: 860px) 100vw, 600px" className="z-2 m-0 aspect-auto h-full min-h-[320px] rounded-none" />
            <div className="relative z-2 p-12 max-[860px]:p-7">
              {block.kicker && <span className={cn(monoLabel, "text-brand-accent")}>{localize(block.kicker, locale)}</span>}
              <h2 className="mt-3 mb-4 text-[clamp(28px,3.4vw,42px)]">{localize(story.title, locale)}</h2>
              <p className="text-white/80">{localize(story.excerpt, locale)}</p>
              <div className={btnRow}>
                <Button asChild arrow><AppLink href={`/stories/${story.slug}`}>{localize(block.ctaLabel, locale)}</AppLink></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
