/**
 * OnTime Dental Entities
 * Centralized list of all dental entities/companies in the system
 */

export type Entity = {
  id: string;
  name: string;
  shortName: string;
  location: string;
};

export const entities: Entity[] = [
  {
    id: 'complete-dental-solutions',
    name: 'Complete Dental Solutions of Florida',
    shortName: 'CDS Florida',
    location: 'Jacksonville, FL',
  },
  {
    id: 'ontime-dental-pr',
    name: 'OnTime Dental Puerto Rico',
    shortName: 'OnTime PR',
    location: 'San Juan, PR',
  },
  {
    id: 'smile-care-central',
    name: 'Smile Care Central',
    shortName: 'SCC',
    location: 'Orlando, FL',
  },
  {
    id: 'dental-health-associates',
    name: 'Dental Health Associates',
    shortName: 'DHA',
    location: 'Miami, FL',
  },
];

// Helper function to get entity by ID
export const getEntityById = (id: string): Entity | undefined => {
  return entities.find((entity) => entity.id === id);
};

// Helper function to get entity options for selectors (using short names)
export const getEntityOptions = () => {
  return entities.map((entity) => ({
    id: entity.id,
    name: entity.shortName,
  }));
};
