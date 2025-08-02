export interface HippoColor {
    color: string;
    imgSrc: string;
    audioSrc: string;
}

export const HIPPO_COLORS: HippoColor[] = [
    { color: 'brown',  imgSrc: '/assets/hippos/brownHippo.png',  audioSrc: '/audio/role-select/brown.mp3' },
    { color: 'red',    imgSrc: '/assets/hippos/redHippo.png',    audioSrc: '/audio/role-select/red.mp3' },
    { color: 'purple', imgSrc: '/assets/hippos/purpleHippo.png', audioSrc: '/audio/role-select/purple.mp3' },
    { color: 'green',  imgSrc: '/assets/hippos/greenHippo.png',  audioSrc: '/audio/role-select/green.mp3' },
    { color: 'blue',   imgSrc: '/assets/hippos/blueHippo.png',   audioSrc: '/audio/role-select/blue.mp3' },
    { color: 'orange', imgSrc: '/assets/hippos/orangeHippo.png', audioSrc: '/audio/role-select/orange.mp3' },
    { color: 'yellow', imgSrc: '/assets/hippos/yellowHippo.png', audioSrc: '/audio/role-select/yellow.mp3' },
    { color: 'pink',   imgSrc: '/assets/hippos/pinkHippo.png',   audioSrc: '/audio/role-select/pink.mp3' },
];