'use client';

import MapLibreGLMap from '@/components/MapLibreGL';
// import OpenLayersMap from '@/components/OpenLayersMap';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import * as dayjs from 'dayjs';
import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

const Home = () => {
    // FUTURE DEVELOPMENT

    // const [state, setState] = React.useState({
    //     raceData: null,
    //     eventData: null,
    //     activeRaceData: null,
    //     activeEventData: null,
    //     activePlayerData: null,
    //     activePlayerKey: null,
    //     openActivePlayerSingle: null,
    //     activePlayerSingle: null,
    //     mapLibre: null,
    // });

    // FUTURE DEVELOPMENT

    const [raceData, setRaceData] = React.useState(null);
    const [trailData, setTrailData] = React.useState(null);
    const [eventData, setEventData] = React.useState(null);
    const [showPath, setShowPath] = React.useState(false);

    const [openRaceData, setOpenRaceData] = React.useState(false);
    const [activePlayerData, setActivePlayerData] = React.useState(null);
    const [activePlayerKey, setActivePlayerKey] = React.useState(null);

    const [activeRaceData, setActiveRaceData] = React.useState(null);
    const [activeEventData, setActiveEventData] = React.useState(null);
    const [openActivePlayerSingle, setOpenActivePlayerSingle] =
        React.useState(null);
    const [activePlayerSingle, setActivePlayerSingle] = React.useState(null);
    const [activePlayerSingleData, setActivePlayerSingleData] = React.useState(null);

    const mapRef = React.useRef(null);
    const [mapLibre, setMapLibre] = React.useState(null);

    const groupDataByRunnerBIBNo = (data) => {
        const groupedData = data.reduce((acc, current) => {
            const key = current.BIBNo;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(current);
            return acc;
        }, {});

        return groupedData;
    };

    const fetchData = async () => {
        console.log('fetching data...');
        const race = await fetch('https://map.race.id/api/race/2');
        const raceJson = await race.json();
        const trail = await fetch('https://map.race.id/api/data/2');
        const trailJson = await trail.json();
        setRaceData(raceJson.map((race) => ({ value: `${race.maseId}_${race.raceName} - ${race.maseEventName}`, label: `${race.raceName} - ${race.maseEventName}` })));
        setTrailData(trailJson);
    };

    React.useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    // FUTURE DEVELOPMENT

    // const handleRaceChange = (newRaceData) => {
    //     setState((prevState) => ({ ...prevState, activeRaceData: newRaceData }));
    // };

    // const handleEventDataChange = (newEventData) => {
    //     setState((prevState) => ({ ...prevState, activeEventData: newEventData }));
    // };

    // FUTURE DEVELOPMENT

    const fetchEventData = async () => {
        try {
            const event = await fetch(`https://map.race.id/api/event/${activeRaceData.split('_')[0]}`);
            const eventJson = await event.json();
            setEventData(eventJson[0]);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        if (activeRaceData) {
            fetchEventData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRaceData]);

    React.useMemo(() => {
        const fetchParticipantData = async () => {
            // const raceId = activeEventData.split('_')[0];
            const raceId = 2;
            const participant = await fetch(
                // `https://map.race.id/api/participantByRace/${parseInt(raceId)}`
                `https://map.race.id/api/participantByRace/${parseInt(raceId)}`
            );
            const participantJson = await participant.json();

            setActivePlayerData(groupDataByRunnerBIBNo(participantJson));
            let filtered = []
            participantJson.filter((x) => {
                if (x.Longitude == null || x.Name == null) {
                    filtered.push({
                        BIBNo: x.BIBNo,
                        Name: x.Name,
                    })
                }
            });
            console.log(filtered);
            setActivePlayerKey(
                Object.keys(groupDataByRunnerBIBNo(participantJson))
            );
        };
        if (activeEventData) {
            fetchParticipantData();
        }
    }, [activeEventData]);

    // console.log(activePlayerSingle);
    // console.log(activePlayerData);

    React.useEffect(() => {
        if (activePlayerData && activePlayerSingle) {
            const participantData = activePlayerData[activePlayerSingle.split('_')[0]];
            setActivePlayerSingleData(participantData[0]);
        }
    }, [activePlayerData, activePlayerSingle])

    // console.log(activePlayerSingleData);

    return (
        <main className="max-sm:flex-col flex max-sm:h-[100vh]">
            <div className="sidebar basis-2/12 bg-white px-4 py-2 max-sm:order-2">
                <div className="title-wrapper my-2 text-center max-sm:mb-2 max-sm:mt-0">
                    <div className="relative h-[160px] max-sm:h-[80px]">
                        <Image
                            src="logopon.png"
                            alt="Picture of the author"
                            sizes='(min-width: 808px) 50vw, 100vw'
                            fill
                            style={{
                                objectFit: 'contain', // cover, contain, none
                            }}
                        />
                    </div>
                    <span className="text-xl font-bold max-sm:text-sm">
                        PON Trail Run Tracker
                    </span>
                </div>
                <Separator />
                <div className="infoPanel max-sm:max-h-[160px] max-sm:overflow-scroll">
                <div className="race-selector mt-4">
                    {raceData && (
                        <Popover
                            open={openRaceData}
                            onOpenChange={setOpenRaceData}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {activeRaceData
                                        ? raceData.find(
                                              (race) =>
                                                  race.value === activeRaceData
                                          )?.label
                                        : 'Pilih perlombaan...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Pilih perlombaan..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            Tidak ada perlombaan.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {raceData.map((race) => (
                                                <CommandItem
                                                    className="cursor-pointer"
                                                    key={race.value}
                                                    value={race.value}
                                                    onSelect={(
                                                        currentValue
                                                    ) => {
                                                        setActiveRaceData(
                                                            currentValue ===
                                                                activeRaceData
                                                                ? ''
                                                                : currentValue
                                                        );
                                                        setActiveEventData(
                                                            currentValue ===
                                                                activeRaceData
                                                                ? ''
                                                                : currentValue
                                                        );
                                                        setOpenRaceData(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            activeRaceData ===
                                                                race.value
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                    {race.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                {activePlayerData && activePlayerKey && (
                    <div className="event-selector mt-4">
                        {activePlayerData && (
                            <Popover
                                open={openActivePlayerSingle}
                                onOpenChange={setOpenActivePlayerSingle}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {activePlayerSingle
                                            ? activePlayerSingle
                                            : 'Pilih peserta...'}
                                        {/* {activePlayerSingle
                                            ? activePlayerKey.find(
                                                  (event) =>
                                                      `${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}` ===
                                                      activePlayerSingle
                                              )?.label
                                            : 'Pilih peserta...'} */}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Pilih peserta..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                Tidak ada peserta.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {activePlayerKey.map(
                                                    (event) => {
                                                        return (
                                                            <CommandItem
                                                                className="cursor-pointer"
                                                                key={`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                                value={`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                                onSelect={(
                                                                    currentValue
                                                                ) => {
                                                                    setActivePlayerSingle(
                                                                        currentValue ===
                                                                            activePlayerSingle
                                                                            ? ''
                                                                            : currentValue
                                                                    );
                                                                    setOpenActivePlayerSingle(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        activePlayerSingle ===
                                                                            `${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                            </CommandItem>
                                                        );
                                                    }
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
                {activePlayerData && activePlayerKey && <div className="items-top flex space-x-2 pt-4">
                    <Checkbox id="terms1" disabled={!activePlayerSingle} checked={showPath} onCheckedChange={() => setShowPath(!showPath)} />
                    <label
                        htmlFor="terms1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                    >
                        Show Participant Path
                    </label>
                </div>}
                    {activePlayerData && activePlayerKey && activePlayerSingle && activePlayerSingleData && (
                        <Card className="w-full my-4">
                            <CardHeader className="max-sm:p-4">
                                <CardTitle className="max-sm:text-sm">{activePlayerSingleData.Name}</CardTitle>
                                <CardDescription className="max-sm:text-xs">#{activePlayerSingleData.BIBNo}</CardDescription>
                            </CardHeader>
                            <CardContent className="max-sm:p-4">
                                <form>
                                    <div className="grid w-full items-center gap-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label className="max-sm:text-xs" htmlFor="name">Terakhir Dilihat</Label>
                                            <p className="max-sm:text-xs">{dayjs(activePlayerSingleData.CapturedTime).format('DD-MM-YYYY HH:mm:ss')}</p>
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label className="max-sm:text-xs" htmlFor="name">Koordinat</Label>
                                            <p className="max-sm:text-xs">{activePlayerSingleData.Longitude}, {activePlayerSingleData.Latitude}</p>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                <div className="reset-button mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.reload();
                        }}
                        className="w-full"
                    >
                        Reset
                    </Button>
                </div>
                </div>
            </div>
            <div className="map-wrapper h-[100vh] max-sm:basis-full basis-10/12 max-sm:order-1 w-[100vw]">
                {/* <OpenLayersMap
                    eventData={eventData}
                    raceData={raceData}
                    activePlayerData={activePlayerData}
                    activePlayerKey={activePlayerKey}
                    activePlayerSingle={activePlayerSingle}
                /> */}
                <MapLibreGLMap
                    eventData={eventData}
                    raceData={raceData}
                    activeRaceData={activeRaceData}
                    activeEventData={activeEventData}
                    activePlayerData={activePlayerData}
                    activePlayerKey={activePlayerKey}
                    activePlayerSingle={activePlayerSingle}
                    mapRef={mapRef}
                    mapLibre={mapLibre}
                    setMapLibre={setMapLibre}
                    trailData={trailData}
                    showPath={showPath}
                />
            </div>
        </main>
    );
};

export default Home;
