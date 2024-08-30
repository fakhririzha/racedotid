/* eslint-disable react/prop-types */
'use client';

import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Polyline from 'ol/format/Polyline.js';
import Point from 'ol/geom/Point.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import 'ol/ol.css';
// import ImageTile from 'ol/source/ImageTile.js';
// import { Button } from '@/components/ui/button';
// import { Overlay } from 'ol';
import LineString from 'ol/geom/LineString.js';
import { transform } from 'ol/proj';
// import { getVectorContext } from 'ol/render.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style.js';
import * as React from 'react';

const OpenLayersMap = ({
    eventData,
    // raceData,
    activePlayerData,
    activePlayerKey,
    // activePlayerSingle,
}) => {
    const mapRef = React.useRef(null);

    // eslint-disable-next-line no-unused-vars
    const [olMap, setOlMap] = React.useState();

    React.useEffect(() => {
        const map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View(),
        });

        setOlMap(map);

        return () => map.setTarget(undefined);
    }, []);

    React.useEffect(() => {
        if (eventData) {
            console.log('eventData77', eventData);
            const currentPath =
                eventData?.maseRoute?.features[0]?.geometry?.coordinates;

            const polyline = new Polyline({ factor: 1e6 }).writeGeometry(
                new LineString(currentPath)
            );

            const route = new Polyline({
                factor: 1e6,
            }).readGeometry(polyline, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });

            const routeFeature = new Feature({
                type: 'route',
                geometry: route,
            });
            const startMarker = new Feature({
                type: 'icon',
                geometry: new Point(route.getFirstCoordinate()),
            });
            const endMarker = new Feature({
                type: 'icon',
                geometry: new Point(route.getLastCoordinate()),
            });
            const position = endMarker.getGeometry().clone();
            console.log('position', position);
            console.log('route.getLastCoordinate()', route.getLastCoordinate());
            const geoMarker = new Feature({
                geometry: position,
                type: 'geoMarker',
                name: 'Fakhri',
            });

            // let sampleA = [106.74825778, -6.18281389];
            // let sampleB = [106.74803556, -6.18348167];

            // const poly2 = new Polyline({ factor: 1e6 }).writeGeometry(
            //     new LineString(sampleA)
            // );

            // const route2 = new Polyline({
            //     factor: 1e6,
            // }).readGeometry(poly2, {
            //     dataProjection: 'EPSG:4326',
            //     featureProjection: 'EPSG:3857',
            // });

            console.log(
                'hehe',
                transform([106.74825778, -6.18281389], 'EPSG:4326', 'EPSG:3857')
            );

            const styles = {
                route: new Style({
                    stroke: new Stroke({
                        width: 3,
                        color: [0, 0, 0, 0.8],
                    }),
                }),
                icon: new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: 'redflag.png',
                    }),
                }),
                geoMarker: new Style({
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({ color: 'black' }),
                        stroke: new Stroke({
                            color: 'white',
                            width: 2,
                        }),
                    }),
                }),
                geoMarker2: new Style({
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({ color: 'red' }),
                        stroke: new Stroke({
                            color: 'black',
                            width: 2,
                        }),
                    }),
                }),
            };

            const vectorSource = new VectorSource({
                features: [routeFeature, geoMarker, startMarker, endMarker],
                // features: [routeFeature, startMarker, endMarker],
            });

            let coba = new Feature({
                type: 'geoMarker2',
                geometry: new Point(
                    transform(
                        [106.74825778, -6.18281389],
                        'EPSG:4326',
                        'EPSG:3857'
                    )
                ),
            });

            vectorSource.addFeature(coba);

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: function (feature) {
                    return styles[feature.get('type')];
                },
            });

            olMap
                .getView()
                .fit(vectorLayer.getSource().getExtent(), olMap.getSize(), {
                    padding: [30, 30, 30, 30],
                });

            let center = olMap.getView().getCenter();
            olMap.getView().setCenter(center);

            olMap.addLayer(vectorLayer);

            // const speedInput = document.getElementById('speed');
            // const startButton = document.getElementById('start-animation');
            // let animating = false;
            // let distance = 0;
            // let lastTime;

            // const moveFeature = (event) => {
            //     const speed = Number(speedInput.value);
            //     const time = event.frameState.time;
            //     const elapsedTime = time - lastTime;
            //     distance = (distance + (speed * elapsedTime) / 1e6) % 2;
            //     lastTime = time;

            //     const currentCoordinate = route.getCoordinateAt(
            //         distance > 1 ? 2 - distance : distance
            //     );
            //     position.setCoordinates(currentCoordinate);
            //     const vectorContext = getVectorContext(event);
            //     vectorContext.setStyle(styles.geoMarker);
            //     vectorContext.drawGeometry(position);
            //     // tell OpenLayers to continue the postrender animation
            //     olMap.render();
            // };

            // const startAnimation = () => {
            //     animating = true;
            //     lastTime = Date.now();
            //     startButton.textContent = 'Stop Animation';
            //     vectorLayer.on('postrender', moveFeature);
            //     // hide geoMarker and trigger map render through change event
            //     geoMarker.setGeometry(null);
            // };

            // const stopAnimation = () => {
            //     animating = false;
            //     startButton.textContent = 'Start Animation';

            //     // Keep marker at current animation position
            //     geoMarker.setGeometry(position);
            //     vectorLayer.un('postrender', moveFeature);
            // };

            // startButton.addEventListener('click', () => {
            //     if (animating) {
            //         stopAnimation();
            //     } else {
            //         startAnimation();
            //     }
            // });
        }
    }, [olMap, eventData, activePlayerData, activePlayerKey]);

    return (
        <>
            <div ref={mapRef} id="map" className="map h-[100vh] w-full">
                <div id="popup"></div>
            </div>
            {/* <div className="coordinates-container">
                <label htmlFor="speed">
                    Speed:&nbsp;
                    <input
                        id="speed"
                        type="range"
                        min="10"
                        max="999"
                        step="10"
                        defaultValue="60"
                    />
                </label>
                <Button id="start-animation" className="m-2">
                    Replay
                </Button>
            </div> */}
        </>
    );
};

export default OpenLayersMap;
