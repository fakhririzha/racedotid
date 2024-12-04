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

import { useParams } from 'next/navigation';

const Race = () => {
    const params = useParams();
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
    const [autoZoom, setAutoZoom] = React.useState('Map');

    const [activePlayerData, setActivePlayerData] = React.useState(null);
    const [activePlayerKey, setActivePlayerKey] = React.useState(null);

    const [activeRaceId, setActiveRaceId] = React.useState(null);
    // eslint-disable-next-line no-unused-vars
    const [activeRaceData, setActiveRaceData] = React.useState(null);
    const [activeEventData, setActiveEventData] = React.useState(null);
    const [openActivePlayerSingle, setOpenActivePlayerSingle] =
        React.useState(null);
    const [activePlayerSingle, setActivePlayerSingle] = React.useState(null);
    const [activePlayerSingleData, setActivePlayerSingleData] = React.useState(null);

    const [isShowNumber, setIsShowNumber] = React.useState(true);
    const [isShowName, setIsShowName] = React.useState(true);
    const [isShowLastSeen, setIsShowLastSeen] = React.useState(false);
    const [isShowLegend, setIsShowLegend] = React.useState(false);

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
        const race = await fetch(`https://map.race.id/api/race/${activeRaceId}`);
        const raceJson = await race.json();
        const trail = await fetch(`https://map.race.id/api/data/${activeRaceId}`);
        const trailJson = await trail.json();
        setRaceData(raceJson.map((race) => ({ value: `${race.maseId}_${race.raceName} - ${race.maseEventName}`, label: `${race.raceName} - ${race.maseEventName}`, logo: race.raceLogo ? `${race.raceLogo}` : null })));
        setTrailData(trailJson);
    };

    const fetchEventData = async () => {
        try {
            const event = await fetch(`https://map.race.id/api/event/${params.id}`);
            const eventJson = await event.json();
            setEventData(eventJson[0]);
            setActiveRaceId(eventJson[0].maseRaceId);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        // fetchData();
        setActiveEventData(params.id);
        fetchEventData();

        const intervalId = setInterval(fetchEventData, 5000);

        // cleanup function
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    React.useEffect(() => {
        if (activeRaceId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRaceId]);

    React.useMemo(() => {
        const fetchParticipantData = async () => {
            const eventId = activeEventData.split('_')[0];
            const participant = await fetch(
                `https://map.race.id/api/participantByRace/${parseInt(activeRaceId)}`
            );
            const participantJson = await participant.json();

            const filteredParticipant = participantJson.filter((x) => {
                if (x.eventId == eventId && x.Name != null) {
                    return x;
                }
            });

            setActivePlayerData(groupDataByRunnerBIBNo(filteredParticipant));
            let filteredNull = [];
            filteredParticipant.filter((x) => {
                if (x.Longitude == null || x.Name == null) {
                    filteredNull.push({
                        BIBNo: x.BIBNo,
                        Name: x.Name,
                    })
                }
            });
            setActivePlayerKey(
                Object.keys(groupDataByRunnerBIBNo(filteredParticipant))
            );
        };
        if (activeRaceId) {
            fetchParticipantData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRaceId]);

    React.useEffect(() => {
        if (activePlayerData && activePlayerSingle) {
            const participantData = activePlayerData[activePlayerSingle.split('_')[0]];
            setActivePlayerSingleData(participantData[0]);
        }
    }, [activePlayerData, activePlayerSingle]);

    return (
        <main className="max-sm:flex-col flex max-sm:h-[100vh]">
            <div className="sidebar basis-2/12 bg-white px-4 py-2 max-sm:order-2">
                <div className="title-wrapper my-2 text-center max-sm:mb-2 max-sm:mt-0">
                    <div className="relative h-[160px] max-sm:h-[80px]">
                        <Image
                            src={raceData && raceData[0] && raceData[0].logo !== null ? raceData[0].logo : "../logo-default.png"}
                            alt="logo-default"
                            sizes='(min-width: 808px) 50vw, 100vw'
                            fill
                            style={{
                                objectFit: 'contain', // cover, contain, none
                            }}
                        />
                    </div>
                    <span className="text-xl font-bold max-sm:text-sm">
                        {raceData && raceData[0] && raceData[0].label || "Live Tracker"}
                    </span>
                </div>
                <Separator />
                <div className="infoPanel max-sm:max-h-[160px] max-sm:overflow-scroll">
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
                                                                        // if (activePlayerSingle !== null && currentValue !== activePlayerSingle) {
                                                                        //     setAutoZoom('Reset New Participant');
                                                                        // }
                                                                        setActivePlayerSingle(
                                                                            currentValue ===
                                                                                activePlayerSingle
                                                                                ? ''
                                                                                : currentValue
                                                                        );
                                                                        setOpenActivePlayerSingle(
                                                                            false
                                                                        );
                                                                        setAutoZoom('Participant');
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
                    {activePlayerData && activePlayerKey && (
                        <div className="flex flex-col gap-y-2 pt-4">
                            <label
                                htmlFor="terms7"
                                className="text-sm font-medium leading-none ptext-primary"
                            >
                                Trail Options
                            </label>
                            <div className="flex gap-x-2">
                                <div className="items-top flex space-x-2 pt-2">
                                    <Checkbox id="terms1" disabled={!activePlayerSingle} checked={showPath} onCheckedChange={() => setShowPath(!showPath)} />
                                    <label
                                        htmlFor="terms1"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                    >
                                        Trail Peserta
                                    </label>
                                </div>
                                <div className="items-top flex space-x-2 pt-2">
                                    <Checkbox id="terms7" checked={isShowLegend} onCheckedChange={() => setIsShowLegend(!isShowLegend)} />
                                    <label
                                        htmlFor="terms7"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                    >
                                        Legend
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                    {activePlayerData && activePlayerKey && activePlayerSingle && activePlayerSingleData && (
                        <Card className="w-full my-4">
                            <CardHeader className="p-4">
                                <CardTitle className="max-sm:text-sm text-lg">{activePlayerSingleData.Name}</CardTitle>
                                <CardDescription className="max-sm:text-xs text-sm">#{activePlayerSingleData.BIBNo}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <form>
                                    <div className="grid w-full items-center gap-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label className="max-sm:text-xs text-sm" htmlFor="name">Terakhir Dilihat</Label>
                                            <p className="max-sm:text-xs text-sm">{dayjs(activePlayerSingleData.CapturedTime).format('DD-MM-YYYY HH:mm:ss')}</p>
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label className="max-sm:text-xs" htmlFor="name">Koordinat</Label>
                                            <p className="max-sm:text-xs text-sm">{activePlayerSingleData.Longitude}, {activePlayerSingleData.Latitude}</p>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                    {/* {activePlayerData && activePlayerKey && activePlayerSingle && activePlayerSingleData && <div className="reset-button mt-4">
                        <label
                            htmlFor="terms1"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                        >
                            Menu Autofocus
                        </label>
                        <div className="grid grid-cols-2 gap-x-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAutoZoom('Reset')
                                }}
                                className="w-full"
                                disabled={autoZoom === true || autoZoom === 'Reset'}
                            >
                                Reset/On
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAutoZoom(false)
                                }}
                                className="w-full"
                                disabled={autoZoom === false}
                            >
                                Off
                            </Button>
                        </div>
                    </div>} */}
                    {activePlayerData && activePlayerKey && activePlayerSingle && activePlayerSingleData && <div className="reset-button mt-4">
                        <div className="flex flex-col gap-y-2 pb-4">
                            <label
                                htmlFor="terms2"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                            >
                                Participant Options
                            </label>
                            <div className="flex gap-x-2 py-1">
                                <div className="flex gap-x-2 py-1">
                                <Checkbox id="terms3" disabled={!activePlayerSingle} checked={isShowNumber} onCheckedChange={() => setIsShowNumber(!isShowNumber)} />
                                <label
                                    htmlFor="terms3"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                >
                                        Nomor
                                </label>
                            </div>
                            <div className="flex gap-x-2 py-1">
                                <Checkbox id="terms4" disabled={!activePlayerSingle} checked={isShowName} onCheckedChange={() => setIsShowName(!isShowName)} />
                                <label
                                    htmlFor="terms4"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                >
                                        Nama
                                </label>
                            </div>
                            <div className="flex gap-x-2 py-1">
                                <Checkbox id="terms4" disabled={!activePlayerSingle} checked={isShowLastSeen} onCheckedChange={() => setIsShowLastSeen(!isShowLastSeen)} />
                                <label
                                    htmlFor="terms4"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                >
                                        Last Seen
                                </label>
                            </div>
                            </div>
                        </div>
                        <label
                            htmlFor="terms1"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                        >
                            Menu Autofocus on Map
                        </label>
                        <div className="grid grid-cols-2 gap-x-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAutoZoom('Reset');
                                    if (activePlayerData) {
                                        setAutoZoom('Map');
                                    }
                                }}
                                className="w-full"
                                disabled={autoZoom === 'Map' || autoZoom === 'Participant'}
                            >
                                Reset/On
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAutoZoom(false);
                                }}
                                className="w-full"
                                disabled={autoZoom === 'Participant' || autoZoom === false}
                            >
                                Off
                            </Button>
                        </div>
                        {activePlayerSingle && (
                            <>
                                <label
                                    htmlFor="terms1"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
                                >
                                    Menu Autofocus on Participant
                                </label>
                                <div className="grid grid-cols-2 gap-x-2 mt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setAutoZoom('Participant');
                                        }}
                                        className="w-full"
                                        disabled={autoZoom === 'Participant' || autoZoom === 'Map' || !activePlayerSingle}
                                    >
                                        On
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setAutoZoom(false);
                                        }}
                                        className="w-full"
                                        disabled={autoZoom === false || autoZoom === 'Map' || autoZoom === false || !activePlayerSingle}
                                    >
                                        Off
                                    </Button>
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-1 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAutoZoom('Back to Center');
                                    setActivePlayerSingle(null);
                                    setActivePlayerSingleData(null);
                                    const playerPopup = document.querySelectorAll(
                                        "[class*='playerPopupComplete-']"
                                    );
                                    if (playerPopup.length > 0) {
                                        playerPopup.forEach((el) => el.remove());
                                    }
                                }}
                                className="w-full"
                            >
                                Center to Track
                            </Button>
                        </div>
                    </div>}
                    <div className="reset-button mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="w-full"
                        >
                            Reload Halaman
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
                    setActivePlayerSingle={setActivePlayerSingle}
                    autoZoom={autoZoom}
                    setAutoZoom={setAutoZoom}
                    isShowName={isShowName}
                    isShowNumber={isShowNumber}
                    isShowLastSeen={isShowLastSeen}
                    isShowLegend={isShowLegend}
                />
            </div>
        </main>
    );
};

export default Race;
