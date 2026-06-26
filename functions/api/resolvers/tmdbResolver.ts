import type { CandidateMatch } from '../../../src/types';
import type { MetadataResolver } from './types';

export class TmdbResolver implements MetadataResolver {
  private apiKey?: string;
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async resolve(candidate: CandidateMatch): Promise<CandidateMatch> {
    if (!this.apiKey) return candidate;

    try {
      const yearParam = candidate.year ? `&year=${candidate.year.trim()}` : "";
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(candidate.title)}${yearParam}`;
      
      const response = await fetch(url);
      if (!response.ok) return candidate;

      const data = await response.json() as any;
      const movie = data.results?.[0];
      if (movie) {
        let imdbId = undefined;
        try {
          const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${this.apiKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json() as any;
            imdbId = detailData.imdb_id;
          }
        } catch (err) {
          console.error("Failed to fetch TMDB details for IMDb ID:", err);
        }

        return {
          ...candidate,
          posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : candidate.posterUrl,
          backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : candidate.backdropUrl,
          imdbId: imdbId || candidate.imdbId,
          tmdbId: String(movie.id) || candidate.tmdbId
        };
      }
    } catch (error) {
      console.error("Failed to fetch TMDB movie art:", error);
    }
    return candidate;
  }
}
