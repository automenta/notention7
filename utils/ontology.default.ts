
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
          email: { type: 'string', description: 'Email address' },
          phone: { type: 'string', description: 'Phone number' },
        },
      },
      {
        id: 'organization',
        label: 'Organization',
        description: 'A group of people with a particular purpose.',
        attributes: {
          website: { type: 'string', description: 'Official website URL' },
        },
      },
      {
        id: 'place',
        label: 'Place',
        description: 'A specific point on Earth or in space.',
        attributes: {
          address: { type: 'string', description: 'Physical street address' },
          location: { type: 'geo', description: 'Geographic coordinates' },
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
      startDateTime: { type: 'datetime', description: 'The start date and time' },
      endDateTime: { type: 'datetime', description: 'The end date and time' },
      venue: { type: 'string', description: 'The name of the place where the event takes place' },
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
          status: { type: 'enum', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], description: 'Current status of the project.' },
          deadline: { type: 'date', description: 'The date the project is due.' },
        },
      },
      {
        id: 'task',
        label: 'Task',
        description: 'A piece of work to be done.',
        attributes: {
          priority: { type: 'enum', options: ['Low', 'Medium', 'High', 'Urgent'], description: 'The priority of the task.' },
          dueDate: { type: 'date', description: 'The date the task should be completed by.' },
          completed: { type: 'enum', options: ['true', 'false'], description: 'Whether the task is completed.' },
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
                startDateTime: { type: 'datetime' },
                attendees: { type: 'string' },
                venue: { type: 'string' },
                location: { type: 'geo' },
            }
        },
        {
            id: 'template-person',
            label: 'Person Profile',
            description: 'To keep track of a contact.',
            attributes: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                organization: { type: 'string' }
            }
        },
        {
            id: 'template-project',
            label: 'Project Plan',
            description: 'To outline a new project.',
            attributes: {
                status: { type: 'enum', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'] },
                deadline: { type: 'date' },
                budget: { type: 'number' },
                stakeholders: { type: 'string' },
            }
        }
    ]
  }
];
