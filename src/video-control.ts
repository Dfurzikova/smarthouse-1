import * as MyFlux  from '../framework/MyFlux';
import * as components from '../components/All';
// import * as Hls from 'hls.js';

interface VideoPage {
    filters:{ 
        [key: string]: string
    };
    video: HTMLVideoElement;
}
interface VolumeAnalizator {
    video:HTMLVideoElement;
    contexts:{ 
        [key: string]: string
    };
    context: AudioContext;
    analyser: AnalyserNode;
    source: MediaElementAudioSourceNode;
    node: ScriptProcessorNode
}
type K_MANIFEST_PARSED = "hlsManifestParsed";

declare class Hls {
    static isSupported(): boolean;
    loadSource(source: string): void;
    attachMedia(videoElement: HTMLVideoElement): void;
    on(event: K_MANIFEST_PARSED, callback: (event: K_MANIFEST_PARSED, data: Hls.manifestParsedData) => void): void;
    static Events: { MANIFEST_PARSED: K_MANIFEST_PARSED}
}

class VideoPage  {
    constructor() {
        this.getVideo();
        this.bindEvents();
    }

    getVideo() {
        const videos = [
            'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8',
            'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8',
            'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8',
            'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8'
        ];

        for (let i = 0; i < videos.length; i++) {
            let currentVideo = <HTMLVideoElement>document.getElementById('video-' + i)

            if (!currentVideo) {
                continue;
            }

            this.initVideo(currentVideo, videos[i]);
        }
    }

    initVideo(video: HTMLVideoElement, url: string)  {
        if (Hls.isSupported()) {
            const hls= new Hls();

            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }
    }

    bindEvents() {
        const container = <HTMLElement>document.querySelector('.video-content');
        const buttonBack = <HTMLElement>document.querySelector('.button__backward');
        const controls = <HTMLElement>document.querySelector('.video-controls');
        const inputBrightness = <HTMLElement>document.querySelector('.brightness');
        const inputContrast = <HTMLElement>document.querySelector('.contrast');
        // const volume = <HTMLElement>document.querySelector('.button__volume');

        if (!container) {
            return;

        }

        container.addEventListener('click', this.showFullVideo.bind(this, controls));
        buttonBack.addEventListener('click', this.hideVideo.bind(this, controls));
        // volume.addEventListener('click', this.toggleMute.bind(this));
        inputBrightness.addEventListener('input', this.setFilters.bind(this));
        inputContrast.addEventListener('input', this.setFilters.bind(this));
    }

    showFullVideo(controls: HTMLElement, event: Event) {
        let videoTargetElem = <HTMLVideoElement>event.target;
        
        if (!videoTargetElem) {
            return
        }

        let elemTag: string = videoTargetElem.tagName

        if (elemTag !== 'VIDEO' || this.video === event.target) {
            return;
        }
        event.preventDefault();

        this.video = videoTargetElem; 

        new VolumeAnalizator(this.video)
        
        this.video.play();
        let parentNode = <HTMLElement>this.video.parentNode;

        this.moveDom(this.video, parentNode, document.body)
            .then(() => {
                controls.style.display = 'flex';
            })
            .catch((error) => {
                console.log(error);
            });
    }

    moveDom(dom: HTMLElement, from: HTMLElement, to: HTMLElement, goHome?: Boolean) {
        let promise = new Promise((resolve) => {
            this.setPosition(dom, from);

            dom.style.transition = '';

            window.requestAnimationFrame(() => {
                this.setPosition(dom, to);

                dom.style.transition = 'all 1s';
                setTimeout(resolve, 1010);
            });
        });

        if (goHome) {
            promise.then(() => {
                dom.style.transition = '';
                dom.style.position = '';
                dom.style.width = '';
                dom.style.height = '';
                dom.style.left = '';
                dom.style.top = '';
            })
        }
        return promise;
    }

    setPosition(dom: HTMLElement, to: HTMLElement) {
        const toRect = to.getBoundingClientRect();

        dom.style.position = 'fixed';

        if (to === document.body) {
            dom.style.width = '100%';
            dom.style.height = '100%';
            dom.style.left = '0';
            dom.style.top = '0';
        } else {
            dom.style.width = toRect.width + 'px';
            dom.style.height = toRect.height + 'px';
            dom.style.left = toRect.left + 'px';
            dom.style.top = toRect.top + 'px';
        }
    }

    hideVideo(controls: HTMLElement) {
        let parentNode = <HTMLElement>this.video.parentNode;

        this.video.muted = Boolean(1);
        controls.style.display = 'none';
        this.moveDom(this.video, document.body, parentNode, true);
    }

    setFilters(e: Event) {
        let target = <HTMLElement>e.target
        
        if (!target) {
            return
        }

        const type: string | null = target.getAttribute('control');

        this.filters = {};
        const filters = this.filters;

        let inputTarget = <HTMLInputElement>e.target;
        let inputValue: string = inputTarget.value;

        if (type != null) {
            filters[type] = inputValue;
        }

        this.video.style.filter = Object.keys(filters).reduce((acc, key) => {
            return acc + key + '(' + filters[key] + '%) ';
        }, '');
    }
};

class VolumeAnalizator {
    constructor(video: HTMLVideoElement) {
        this.video = video
        this.contexts = {}
        this.analyze(video) 
    }

    analyze(video: HTMLVideoElement) {
        if (video.dataset.context) {
           
            return;
        }
        this.context = new AudioContext();
        
        video.dataset.context = 'true';
        
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.3;
        this.analyser.fftSize = 512;

        this.source = this.context.createMediaElementSource(video);
        this.source.connect(this.analyser);
        this.source.connect(this.context.destination);

        this.node = this.context.createScriptProcessor(512, 1, 1);
        this.node.connect(this.context.destination);
        this.analyser.connect(this.node);

        this.node.addEventListener('audioprocess', this.getVolumeValue.bind(this));
    }

    getVolumeValue() {
        const array = new Uint8Array(this.analyser.frequencyBinCount);
        let currentVolume;

        this.analyser.getByteFrequencyData(array);

        currentVolume = array.reduce((a, b) => {
            return a > b ? a : b
        });

        this.drowValue(currentVolume);
    }

    drowValue(value: number) {
        const volumeBackground = <HTMLElement>document.querySelector('.video-controls__background');

        volumeBackground.style.width = (value / 255 * 100) + '%';
    }
}

MyFlux.init({
    components
});

new VideoPage();
