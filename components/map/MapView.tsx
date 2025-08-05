import React, {useEffect, useMemo, useRef} from 'react';
import L from 'leaflet';
import type {Note} from '../types';

interface MapViewProps {
    notes: Note[];
    onSelectNote: (id: string) => void;
}

interface GeoPoint {
    noteId: string;
    noteTitle: string;
    lat: number;
    lng: number;
}

export const MapView: React.FC<MapViewProps> = ({notes, onSelectNote}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    const geoPoints = useMemo<GeoPoint[]>(() => {
        const points: GeoPoint[] = [];
        notes.forEach(note => {
            note.properties.forEach(prop => {
                // This check is simplistic. A robust implementation might check the
                // property type against the ontology.
                if (prop.key === 'location' && prop.values[0] && prop.values[0] !== '...') {
                    const [lat, lng] = prop.values[0].split(',').map(parseFloat);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        points.push({noteId: note.id, noteTitle: note.title, lat, lng});
                    }
                }
            });
        });
        return points;
    }, [notes]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map if it doesn't exist
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (geoPoints.length > 0) {
            geoPoints.forEach(point => {
                const marker = L.marker([point.lat, point.lng]).addTo(map);
                const popupContent = `
                    <div class="font-sans">
                        <h3 class="font-bold text-base mb-1">${point.noteTitle || 'Untitled Note'}</h3>
                        <a href="#" id="note-link-${point.noteId}" class="text-blue-400 hover:underline">View Note &rarr;</a>
                    </div>
                `;
                marker.bindPopup(popupContent);

                marker.on('popupopen', () => {
                    const link = document.getElementById(`note-link-${point.noteId}`);
                    if (link) {
                        link.onclick = (e) => {
                            e.preventDefault();
                            onSelectNote(point.noteId);
                        };
                    }
                });
                markersRef.current.push(marker);
            });
        }

        // Fit map to markers if there are any
        if (markersRef.current.length > 0) {
            const group = new L.FeatureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.2));
        }

    }, [geoPoints, onSelectNote]);

    return (
        <div className="h-full w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4">
            <div ref={mapContainerRef} className="flex-grow w-full"/>
        </div>
    );
};
