export function updateSource(newSources, sources) {
  if (!newSources) return [];
  else {
    newSources
      .map(s => s.annotations)
      .forEach(source => {
        if (source.source_name && !sources.find(s => s.source_name === source.source_name)) sources.push(source);
      });
    return sources;
  }
}
