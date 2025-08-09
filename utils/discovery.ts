/**
 * This file contains logic related to the discovery of notes.
 */

/**
 * A mapping from "imaginary" property keys to "real" property keys.
 * This is used to find notes that satisfy a query. For example, a note
 * with an imaginary property `[looking-for:is:Web Design]` should match
 * a note with a real property `[service:is:Web Design]`.
 *
 * This is a hardcoded mapping for now. In the future, this could be
 * defined in the ontology itself.
 */
export const IMAGINARY_TO_REAL_MAP: Record<string, string> = {
    // Original mappings
    'looking-for': 'service',
    budget: 'price',

    // Generic
    seeking: 'offering',

    // Professional / Recruitment
    'required-skill': 'skill',
    'hiring-for': 'role',

    // Project Management & Deadlines
    'needed-by': 'deadline',
    'available-from': 'startDate',
    'available-until': 'endDate',
    'project-status': 'status',
    'task-priority': 'priority',

    // Location & Events
    'in-city': 'city',
    'near-location': 'location',
    'event-date': 'startDateTime',
};
