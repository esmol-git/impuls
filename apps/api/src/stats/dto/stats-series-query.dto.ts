import { IsIn, IsOptional } from 'class-validator'

export const STATS_RANGES = ['day', 'week', 'month', 'year', 'all'] as const
export type StatsRange = (typeof STATS_RANGES)[number]

export class StatsSeriesQueryDto {
  @IsOptional()
  @IsIn(STATS_RANGES)
  range?: StatsRange = 'week'
}
