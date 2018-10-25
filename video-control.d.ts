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