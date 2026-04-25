import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Project } from "@/data/site";

import { ProjectVisual } from "./project-visual";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="panel grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <div className="space-y-4">
          <span className="eyebrow">{project.category}</span>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {project.title}
            </h3>
            <p className="text-lg leading-7 text-slate-700">{project.tagline}</p>
            <p className="text-base leading-7 text-slate-600">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.deliverables.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
              Timeline
            </p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {project.timeline}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
              Starting point
            </p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {project.priceLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href={`/portfolio/${project.slug}`} className="button-primary">
            View Project
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/contact" className="button-secondary">
            Book Something Similar
          </Link>
        </div>
      </div>

      <ProjectVisual project={project} priority={priority} />
    </article>
  );
}
