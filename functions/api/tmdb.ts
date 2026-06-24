import { CandidateMovie } from '../../src/types';

export async function fetchMovieArtServer(
  title: string,
  year?: string,
  tmdbKey?: string
): Promise<{ posterUrl?: string; backdropUrl?: string; imdbId?: string; tmdbId?: string }> {
  if (!tmdbKey) return {};

  try {
    const yearParam = year ? `&year=${year.trim()}` : "";
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(title)}${yearParam}`;
    const response = await fetch(url);
    if (!response.ok) return {};

    const data = await response.json() as any;
    const movie = data.results?.[0];
    if (movie) {
      let imdbId = undefined;
      try {
        const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbKey}`;
        const detailRes = await fetch(detailUrl);
        if (detailRes.ok) {
          const detailData = await detailRes.json() as any;
          imdbId = detailData.imdb_id;
        }
      } catch (err) {
        console.error("Failed to fetch TMDB details for IMDb ID:", err);
      }

      return {
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined,
        imdbId,
        tmdbId: String(movie.id)
      };
    }
  } catch (error) {
    console.error("Failed to fetch TMDB movie art:", error);
  }
  return {};
}

export async function populateMoviesArtServer(
  movies: CandidateMovie[],
  tmdbKey?: string
): Promise<CandidateMovie[]> {
  if (!movies || movies.length === 0) return movies;

  const promises = movies.map(async (movie) => {
    const art = await fetchMovieArtServer(movie.title, movie.year, tmdbKey);
    movie.posterUrl = art.posterUrl;
    movie.backdropUrl = art.backdropUrl;
    if (art.imdbId) movie.imdbId = art.imdbId;
    if (art.tmdbId) movie.tmdbId = art.tmdbId;
    return movie;
  });

  return Promise.all(promises);
}
