import {
    Popper,
    PopperShape,
    type PopperConfig,
    MAX_Z_INDEX,
    type CanvasOptions,
} from '@moefy-canvas/theme-popper';

interface Options {
    size?: number;
    shape?: 'star' | 'circle';
    zIndex?: number;
}

export default ({ size = 2, shape = PopperShape.Star, zIndex = MAX_Z_INDEX }: Options) => {

    // https://moefy-canvas.nyakku.moe
    const customElement = document.createElement('canvas');
    customElement.id = 'moefy-canvas';
    document.body.appendChild(customElement);

    let shapeI;
    if (shape === 'star') shapeI = PopperShape.Star


    if (shape === 'circle') shape = PopperShape.Circle;

    const themeConfig: PopperConfig = {
        shape: shapeI,
        size,
        numParticles: 10,
    }

    const canvasOptions: CanvasOptions = {
        opacity: 1,
        zIndex,
    }

    const el = document.getElementById('moefy-canvas')
    const popper = new Popper(themeConfig, canvasOptions)
    popper.mount(el as HTMLCanvasElement)

}

