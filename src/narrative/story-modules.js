const STORY_GLOB_PATTERN = '../../stories-yarn/**/*.yarn';

function resolveStoryModules() {
  const viteGlob = import.meta.glob;
  if (typeof viteGlob === 'function') {
    return viteGlob(STORY_GLOB_PATTERN, { as: 'raw' });
  }

  const fallbackGlob = globalThis.import?.meta?.glob;
  if (typeof fallbackGlob === 'function') {
    return fallbackGlob(STORY_GLOB_PATTERN, { as: 'raw' });
  }

  console.warn('story-modules: no glob resolver available; returning empty module map.');
  return {};
}

export const viteStoryModules = resolveStoryModules();
