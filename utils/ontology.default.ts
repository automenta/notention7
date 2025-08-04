
import type { OntologyNode } from '../types';

export const DEFAULT_ONTOLOGY: OntologyNode[] = [
  {
    id: 'entity',
    label: 'Entity',
    description: 'The base for all things that can be identified.',
    children: [
      {
        id: 'person',
        label: 'Person',
        description: 'An individual human being.',
        attributes: {
          email: { type: 'string', description: 'Email address', operators: { real: ['is'], imaginary: ['is not', 'contains'] } },
          phone: { type: 'string', description: 'Phone number', operators: { real: ['is'], imaginary: ['is not'] } },
        },
      },
      {
        id: 'organization',
        label: 'Organization',
        description: 'A group of people with a particular purpose.',
        attributes: {
          website: { type: 'string', description: 'Official website URL', operators: { real: ['is'], imaginary: ['is not', 'contains'] } },
        },
      },
      {
        id: 'place',
        label: 'Place',
        description: 'A specific point on Earth or in space.',
        attributes: {
          address: { type: 'string', description: 'Physical street address', operators: { real: ['is'], imaginary: ['contains'] } },
          location: { type: 'geo', description: 'Geographic coordinates', operators: { real: ['is'], imaginary: ['is near'] } },
        },
      },
    ],
  },
  {
    id: 'concept',
    label: 'Concept',
    description: 'An abstract idea or a general notion.',
    children: [
      {
        id: 'technology',
        label: 'Technology',
        children: [
          { id: 'ai', label: 'AI' },
          { id: 'blockchain', label: 'Blockchain' },
          { id: 'webdev', label: 'Web Development' },
        ],
      },
      { id: 'science', label: 'Science' },
    ],
  },
  {
    id: 'event',
    label: 'Event',
    description: 'Something that happens, especially something of importance.',
    attributes: {
      startDateTime: { type: 'datetime', description: 'The start date and time', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
      endDateTime: { type: 'datetime', description: 'The end date and time', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
      venue: { type: 'string', description: 'The name of the place where the event takes place', operators: { real: ['is'], imaginary: ['is not'] } },
    },
    children: [
      { id: 'meeting', label: 'Meeting' },
      { id: 'conference', label: 'Conference' },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Activity involving mental or physical effort.',
    children: [
      {
        id: 'project',
        label: 'Project',
        description: 'A planned piece of work.',
        attributes: {
          status: { type: 'enum', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], description: 'Current status of the project.', operators: { real: ['is'], imaginary: ['is not'] } },
          deadline: { type: 'date', description: 'The date the project is due.', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
        },
      },
      {
        id: 'task',
        label: 'Task',
        description: 'A piece of work to be done.',
        attributes: {
          priority: { type: 'enum', options: ['Low', 'Medium', 'High', 'Urgent'], description: 'The priority of the task.', operators: { real: ['is'], imaginary: ['is not'] } },
          dueDate: { type: 'date', description: 'The date the task should be completed by.', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
          completed: { type: 'enum', options: ['true', 'false'], description: 'Whether the task is completed.', operators: { real: ['is'], imaginary: ['is not'] } },
        },
      },
    ],
  },
   {
    id: 'templates',
    label: 'Templates',
    description: 'Pre-defined structures for your notes.',
    children: [
        {
            id: 'template-meeting',
            label: 'Meeting Note',
            description: 'For capturing meeting details.',
            attributes: {
                startDateTime: { type: 'datetime', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
                attendees: { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } },
                venue: { type: 'string', operators: { real: ['is'], imaginary: ['is not'] } },
                location: { type: 'geo', operators: { real: ['is'], imaginary: ['is near'] } },
            }
        },
        {
            id: 'template-person',
            label: 'Person Profile',
            description: 'To keep track of a contact.',
            attributes: {
                name: { type: 'string', operators: { real: ['is'], imaginary: ['is not'] } },
                email: { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } },
                phone: { type: 'string', operators: { real: ['is'], imaginary: ['is not'] } },
                organization: { type: 'string', operators: { real: ['is'], imaginary: ['is not', 'contains'] } }
            }
        },
        {
            id: 'template-project',
            label: 'Project Plan',
            description: 'To outline a new project.',
            attributes: {
                status: { type: 'enum', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], operators: { real: ['is'], imaginary: ['is not'] } },
                deadline: { type: 'date', operators: { real: ['is'], imaginary: ['is after', 'is before'] } },
                budget: { type: 'number', operators: { real: ['is'], imaginary: ['less than', 'greater than', 'between'] } },
                stakeholders: { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } },
            }
        }
    ]
  }
];