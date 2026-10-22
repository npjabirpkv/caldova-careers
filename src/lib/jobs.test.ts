import { describe, it, expect } from 'vitest';
import { filterJobs, sortByNewest, formatPostedDate } from './jobs';
import type { Job } from '../types/job';

function makeJob(slug: string, postedDate: string): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department: 'Technology',
        location: 'Remote',
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('filterJobs', () => {
    const jobs: Job[] = [
        { ...makeJob('remote-tech', '2027-01-03'), department: 'Technology', remote: true },
        { ...makeJob('onsite-tech', '2027-01-02'), department: 'Technology', remote: false },
        {
            ...makeJob('contract-finance', '2027-01-01'),
            department: 'Finance',
            remote: false,
            type: 'Contract',
        },
    ];

    it('returns all jobs when no criteria are provided', () => {
        expect(filterJobs(jobs, {})).toEqual(jobs);
    });

    it('filters by department, remote status, and employment type', () => {
        expect(filterJobs(jobs, { department: 'Technology' }).map((job) => job.slug)).toEqual([
            'remote-tech',
            'onsite-tech',
        ]);
        expect(filterJobs(jobs, { remote: true }).map((job) => job.slug)).toEqual([
            'remote-tech',
        ]);
        expect(filterJobs(jobs, { type: 'Contract' }).map((job) => job.slug)).toEqual([
            'contract-finance',
        ]);
    });

    it('combines criteria and does not mutate the input', () => {
        const originalSlugs = jobs.map((job) => job.slug);

        expect(
            filterJobs(jobs, { department: 'Technology', remote: true, type: 'Full-time' }).map(
                (job) => job.slug,
            ),
        ).toEqual(['remote-tech']);
        expect(filterJobs(jobs, { department: 'Technology', type: 'Contract' })).toEqual([]);
        expect(jobs.map((job) => job.slug)).toEqual(originalSlugs);
    });
});

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});
