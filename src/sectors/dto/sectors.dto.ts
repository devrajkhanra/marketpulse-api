export class GetSectorPerformanceResponseDto {
    topGainers: { sector: string; percentageChange: number }[];
    topLosers: { sector: string; percentageChange: number }[];
}

export class GetSectorVolumeRatioResponseDto {
    topVolumeGainers: { sector: string; volumeRatio: number }[];
    topVolumeLosers: { sector: string; volumeRatio: number }[];
}
