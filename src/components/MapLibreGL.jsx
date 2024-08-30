/* eslint-disable react/prop-types */
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as React from 'react';

const MapLibreGLMap = ({
    eventData,
    raceData,
    activePlayerData,
    activePlayerKey,
    activePlayerSingle,
    mapRef,
    mapLibre,
    setMapLibre,
}) => {
    console.log('2731-eventData', eventData);
    console.log('2731-raceData', raceData);
    console.log('2731-activePlayerData', activePlayerData);
    console.log('2731-activePlayerKey', activePlayerKey);
    console.log('2731-activePlayerSingle', activePlayerSingle);

    React.useEffect(() => {
        const map = new maplibregl.Map({
            container: mapRef.current, // container id
            style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=duLQBPKlGnKBOjUnRfnO', // style URL
            center: [107.6196, -6.87063],
            zoom: 15,
        });
        setMapLibre(map);
    }, []);

    React.useEffect(() => {
        if (mapRef && eventData && eventData.maseRoute) {
            const mappedJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            properties: {},
                            coordinates:
                                eventData.maseRoute.features[0].geometry
                                    .coordinates,
                        },
                    },
                ],
            };

            if (mapLibre._loaded) {
                if (mapLibre.getSource('LineString')) {
                    mapLibre.removeLayer('LineString');
                    mapLibre.removeSource('LineString');
                    console.log('2731-haha');
                }
                mapLibre.addSource('LineString', {
                    type: 'geojson',
                    data: mappedJson,
                });
                mapLibre.addLayer({
                    id: 'LineString',
                    type: 'line',
                    source: 'LineString',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#000000',
                        'line-width': 4,
                    },
                });

                const coordinates =
                    eventData.maseRoute.features[0].geometry.coordinates;
                const bounds = coordinates.reduce(
                    (bounds, coords) => {
                        return bounds.extend(coords);
                    },
                    new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                );

                mapLibre.fitBounds(bounds, {
                    padding: 20,
                });

                if (document.getElementById('startEl')) {
                    document.getElementById('startEl').remove();
                    document.getElementById('finishEl').remove();
                }

                const startEl = document.createElement('img');
                startEl.src = 'redflag.png';
                startEl.id = 'startEl';
                const finishEl = document.createElement('img');
                finishEl.src = 'redflag.png';
                finishEl.id = 'finishEl';
                new maplibregl.Marker({ element: startEl })
                    .setLngLat(
                        eventData.maseRoute.features[0].geometry.coordinates[0]
                    )
                    .addTo(mapLibre);
                new maplibregl.Marker({ element: finishEl })
                    .setLngLat(
                        eventData.maseRoute.features[0].geometry.coordinates[
                            eventData.maseRoute.features[0].geometry.coordinates
                                .length - 1
                        ]
                    )
                    .addTo(mapLibre);
            }
        }
    }, [eventData, mapRef, mapLibre]);

    React.useEffect(() => {
        if (activePlayerSingle) {
            let idx = activePlayerSingle.split('_')[0];
            let participantObject = activePlayerData[idx];
            console.log('2731-activePlayerData', participantObject[0]);

            const coordinates = [
                [participantObject[0].Longitude, participantObject[0].Latitude],
            ];
            // console.log('2731-coordinates', participantObject);
            // console.log('2731-coordinates', participantObject);
            const bounds = coordinates.reduce(
                (bounds, coords) => {
                    return bounds.extend(coords);
                },
                new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
            );

            mapLibre.fitBounds(bounds, {
                padding: 20,
            });

            if (document.getElementById('playerEl')) {
                document.getElementById('playerEl').remove();
            }

            const playerEl = document.createElement('img');
            playerEl.src = 'redflag.png';
            playerEl.id = 'startEl';
            new maplibregl.Marker({ element: playerEl })
                .setLngLat(coordinates[0])
                .addTo(mapLibre);
        }
    }, [activePlayerData, activePlayerSingle, mapLibre]);

    return (
        <>
            <div ref={mapRef} id="map" className="h-full" />
        </>
    );
};
export default MapLibreGLMap;
