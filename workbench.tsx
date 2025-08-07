import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { StringInput } from './components/editor/inputs/StringInput';
import { NumberInput } from './components/editor/inputs/NumberInput';
import { DateInput } from './components/editor/inputs/DateInput';
import { DateTimeInput } from './components/editor/inputs/DateTimeInput';
import { EnumInput } from './components/editor/inputs/EnumInput';
import { GeoInput } from './components/editor/inputs/GeoInput';
import { PropertyEditor } from './components/editor/PropertyEditor';

const Workbench = () => {
  const [stringValue, setStringValue] = useState('Hello World');
  const [numberValue, setNumberValue] = useState('123');
  const [dateValue, setDateValue] = useState('2024-08-15');
  const [datetimeValue, setDatetimeValue] = useState('2024-08-15T10:30');
  const [enumValue, setEnumValue] = useState('option2');
  const [geoValue, setGeoValue] = useState('40.7128,-74.0060');

  const enumOptions = ['option1', 'option2', 'option3'];

  const [property, setProperty] = useState<Property>({
    key: 'status',
    operator: 'is',
    values: ['active'],
  });

  const propertyTypes = useMemo<Map<string, OntologyAttribute>>(() => {
    const map = new Map<string, OntologyAttribute>();
    map.set('status', {
      type: 'enum',
      options: ['active', 'inactive', 'archived'],
      operators: { real: ['is', 'is_not'], imaginary: [] },
    });
    map.set('priority', {
      type: 'number',
      operators: { real: ['is'], imaginary: ['>', '<', 'between'] },
    });
    map.set('deadline', {
      type: 'date',
      operators: { real: ['is'], imaginary: ['>', '<'] },
    });
    map.set('assignee', {
      type: 'string',
      operators: { real: ['is'], imaginary: ['contains'] },
    });
    map.set('location', {
      type: 'geo',
      operators: { real: ['is'], imaginary: ['near'] },
    });
    return map;
  }, []);

  const handleSave = (newProperty: Property) => {
    console.log('Saved:', newProperty);
    setProperty(newProperty);
    alert(`Saved: ${JSON.stringify(newProperty)}`);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    alert('Cancelled');
  };

  const handleDelete = () => {
    console.log('Deleted');
    alert('Deleted');
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">
          New Property Editor
        </h2>
        <PropertyEditor
          property={property}
          propertyTypes={propertyTypes}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400">
            Current State:
          </h3>
          <pre className="text-sm text-yellow-300">
            {JSON.stringify(property, null, 2)}
          </pre>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">
          Input Components
        </h2>
        <div className="space-y-8 max-w-md">
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              String Input
            </h3>
            <StringInput value={stringValue} onChange={setStringValue} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Number Input
            </h3>
            <NumberInput value={numberValue} onChange={setNumberValue} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Date Input
            </h3>
            <DateInput value={dateValue} onChange={setDateValue} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              DateTime Input
            </h3>
            <DateTimeInput value={datetimeValue} onChange={setDatetimeValue} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Enum Input
            </h3>
            <EnumInput
              value={enumValue}
              onChange={setEnumValue}
              options={enumOptions}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Geo Input
            </h3>
            <GeoInput
              value={geoValue}
              onChange={setGeoValue}
              onOpenMap={() => alert('Map Opened!')}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Workbench />
  </React.StrictMode>
);

export default Workbench;
