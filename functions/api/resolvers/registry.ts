import type { MediaDomain } from '../../../src/types';
import type { MetadataResolver } from './types';
import { TmdbResolver } from './tmdbResolver';

const resolverRegistry: Record<MediaDomain, (apiKey?: string) => MetadataResolver | null> = {
  movie: (key) => new TmdbResolver(key),
  tv: () => null,
  anime: () => null,
  book: () => null,
  game: () => null,
  song: () => null,
};

export function getResolver(
  domain: MediaDomain,
  apiKeys: Record<string, string | undefined>
): MetadataResolver | null {
  const factory = resolverRegistry[domain];
  return factory ? factory(apiKeys.tmdb) : null;
}
