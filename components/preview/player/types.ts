export interface Position {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}

export interface SubtitleStyle {
    fontFamily: string
    fontSize: number
    color: string
    backgroundColor: string
    opacity: number
    textAlign: string
}

export interface Subtitle {
    id: string
    text: string
    startTime: number
    endTime: number
    position: Position
    style: SubtitleStyle
}

export interface Animation {
    type: string
    duration?: number
}

export interface Border {
    width: number
    style: string
    color: string
}

export interface ImageOverlay {
    id: string
    url: string
    startTime: number
    endTime: number
    position: Position
    size: Size
    rotation: number
    opacity: number
    zIndex: number
    animation?: Animation
    border?: Border
}

export interface TextOverlay {
    id: string
    text: string
    startTime: number
    endTime: number
    position: Position
    style: SubtitleStyle
}
