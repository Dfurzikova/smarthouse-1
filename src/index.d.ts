interface Event {
    clientX: number;
    clientY: number;
    x: number;
}

interface Page {
    templates: { 
        [key: string]: Template
    };
    getDataEvents(): Promise<FetchData>;
}

interface Template {
    (domNode: HTMLElement, data: TemplateData): HTMLElement;
}

interface FetchData {
    events: TemplateData[];
}

interface TemplateData {
    [key:string]: 
        string | 
        TemplateData | 
        string[];
    type: string;
    title: string;
    source: string;
    description: string;
    icon: string;
    size: string;
    buttons: string[];
    data: TemplateData;
}

interface PointerEventsDom {
    pointers: { 
        [key: number]: Event
    };
    image: HTMLElement;

    currentImageX: number;
    currentZoom: number;
    startDistance: number;
    currentStartX: number;
    currentPointerX: number;
    currentDistance: number;
    lastZoom: number;
    pointerArr: number[];

    bindEvents(): void;
    getXPoint(): number;
    getDistance(): number;
    bindEvents(): void;

    onPointerDown(event: PointerEvent): void;
    onPointerMove(event: PointerEvent): void;
    onPointerUp(event: PointerEvent): void;
    directionX(image: HTMLElement): void;
    pinchZoom(image: HTMLElement, event: PointerEvent): void;
}
