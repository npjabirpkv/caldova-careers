/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Optional criteria for narrowing the open-roles listing. */
export interface JobFilterCriteria {
    department?: string;
    location?: string;
    remote?: boolean;
    type?: string;
}

interface FilterableJob {
    department: string;
    location: string;
    remote: boolean;
    type: string;
}

/** Return jobs matching every supplied criterion without mutating the input. */
export function filterJobs<T extends FilterableJob>(
    jobs: T[],
    criteria: JobFilterCriteria,
): T[] {
    return jobs.filter(
        (job) =>
            (criteria.department === undefined || job.department === criteria.department) &&
            (criteria.location === undefined || job.location === criteria.location) &&
            (criteria.remote === undefined || job.remote === criteria.remote) &&
            (criteria.type === undefined || job.type === criteria.type),
    );
}

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
